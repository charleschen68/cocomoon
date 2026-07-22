---
title: 'Flink SQL 死信队列（DLQ）：Raw Source + 双路分流方案'
date: '2026-07-23'
tags: ['flinksql', 'kafka', 'dlq', 'dead-letter-queue', 'raw-format']
draft: false
summary: 'Flink SQL 没有内置通用的 DLQ 语法，采用 Raw Source 读取原始消息、SQL 层容错解析、双路分流到业务 Sink 和 DLQ Topic 的方案。'
images: ['static/images/avatar_bak.png']
---

Flink SQL **没有内置一个通用的 `DLQ` 语法或“解析异常侧输出表”机制**。生产上通常采用：

> **Kafka 原始消息按 `STRING/BYTES` 读取 → SQL/UDF 显式校验 → 合法数据写业务 Sink → 非法数据写 DLQ Kafka Topic**

核心原则是：**不要让 Source Format 在反序列化阶段直接丢掉坏数据**，否则 SQL 层根本看不到原始消息，也就无法写入 DLQ。

## 推荐方案：Raw Source + 双路分流

假设 Kafka 原始消息是 JSON：

```
{
  "user_id": 1001,
  "amount": 99.50,
  "event_time": "2026-07-22 13:00:00"
}
```

### 1. Kafka Source 按原始字符串读取

```
CREATE TABLE kafka_raw_source (
    raw_message STRING,

    kafka_topic STRING METADATA FROM 'topic' VIRTUAL,
    kafka_partition INT METADATA FROM 'partition' VIRTUAL,
    kafka_offset BIGINT METADATA FROM 'offset' VIRTUAL,
    kafka_timestamp TIMESTAMP_LTZ(3) METADATA FROM 'timestamp' VIRTUAL
) WITH (
    'connector' = 'kafka',
    'topic' = 'business-source',
    'properties.bootstrap.servers' = 'localhost:9092',
    'properties.group.id' = 'business-dlq-job',
    'scan.startup.mode' = 'group-offsets',

    'format' = 'raw',
    'raw.charset' = 'UTF-8'
);
```

`raw` 格式会把 Kafka value 原样暴露给 SQL，而不是提前进行 JSON 反序列化。官方文档说明 Raw Format 可以把字节数据读取为单列。

---

### 2. 建立解析视图

可以使用 `JSON_VALUE`、`TRY_CAST` 等函数进行容错解析。

```
CREATE TEMPORARY VIEW parsed_events AS
SELECT
    raw_message,

    JSON_VALUE(raw_message, '$.user_id') AS user_id_raw,
    JSON_VALUE(raw_message, '$.amount') AS amount_raw,
    JSON_VALUE(raw_message, '$.event_time') AS event_time_raw,

    TRY_CAST(
        JSON_VALUE(raw_message, '$.user_id')
        AS BIGINT
    ) AS user_id,

    TRY_CAST(
        JSON_VALUE(raw_message, '$.amount')
        AS DECIMAL(18, 2)
    ) AS amount,

    TRY_CAST(
        JSON_VALUE(raw_message, '$.event_time')
        AS TIMESTAMP(3)
    ) AS event_time,

    kafka_topic,
    kafka_partition,
    kafka_offset,
    kafka_timestamp
FROM kafka_raw_source;
```

`TRY_CAST` 与普通 `CAST` 的差异很关键：

- `CAST('abc' AS BIGINT)`：可能直接让作业失败；
- `TRY_CAST('abc' AS BIGINT)`：返回 `NULL`，作业继续运行。

这是做 SQL 层 DLQ 分流的关键能力。

---

### 3. 定义正常业务 Sink

```
CREATE TABLE business_sink (
    user_id BIGINT,
    amount DECIMAL(18, 2),
    event_time TIMESTAMP(3),
    PRIMARY KEY (user_id) NOT ENFORCED
) WITH (
    'connector' = 'upsert-kafka',
    'topic' = 'business-valid',
    'properties.bootstrap.servers' = 'localhost:9092',
    'key.format' = 'json',
    'value.format' = 'json'
);
```

---

### 4. 定义 DLQ Sink

DLQ 不要只存原始消息，至少需要保存定位和重放所需的上下文：

```
CREATE TABLE dlq_sink (
    raw_message STRING,
    error_code STRING,
    error_message STRING,

    source_topic STRING,
    source_partition INT,
    source_offset BIGINT,
    source_timestamp TIMESTAMP_LTZ(3),

    dlq_timestamp TIMESTAMP_LTZ(3)
) WITH (
    'connector' = 'kafka',
    'topic' = 'business-dlq',
    'properties.bootstrap.servers' = 'localhost:9092',

    'format' = 'json',

    'sink.delivery-guarantee' = 'at-least-once'
);
```

建议字段至少包括：

```
raw_message
error_code
error_message
source_topic
source_partition
source_offset
source_timestamp
job_name / job_version
dlq_timestamp
```

其中 `topic + partition + offset` 是排查、去重和原始消息回溯的核心三元组。

---

### 5. 使用 Statement Set 同时写正常流和 DLQ

```
BEGIN STATEMENT SET;

INSERT INTO business_sink
SELECT
    user_id,
    amount,
    event_time
FROM parsed_events
WHERE user_id IS NOT NULL
  AND amount IS NOT NULL
  AND event_time IS NOT NULL
  AND amount >= 0;

INSERT INTO dlq_sink
SELECT
    raw_message,

    CASE
        WHEN user_id_raw IS NULL THEN 'USER_ID_MISSING'
        WHEN user_id IS NULL THEN 'USER_ID_INVALID'
        WHEN amount_raw IS NULL THEN 'AMOUNT_MISSING'
        WHEN amount IS NULL THEN 'AMOUNT_INVALID'
        WHEN amount < 0 THEN 'AMOUNT_NEGATIVE'
        WHEN event_time_raw IS NULL THEN 'EVENT_TIME_MISSING'
        WHEN event_time IS NULL THEN 'EVENT_TIME_INVALID'
        ELSE 'UNKNOWN_ERROR'
    END AS error_code,

    CASE
        WHEN user_id_raw IS NULL THEN 'user_id field is missing'
        WHEN user_id IS NULL THEN CONCAT(
            'user_id is not a valid BIGINT: ',
            COALESCE(user_id_raw, 'NULL')
        )
        WHEN amount_raw IS NULL THEN 'amount field is missing'
        WHEN amount IS NULL THEN CONCAT(
            'amount is not a valid DECIMAL: ',
            COALESCE(amount_raw, 'NULL')
        )
        WHEN amount < 0 THEN CONCAT(
            'amount must be non-negative: ',
            CAST(amount AS STRING)
        )
        WHEN event_time_raw IS NULL THEN 'event_time field is missing'
        WHEN event_time IS NULL THEN CONCAT(
            'event_time has invalid format: ',
            COALESCE(event_time_raw, 'NULL')
        )
        ELSE 'unknown validation error'
    END AS error_message,

    kafka_topic,
    kafka_partition,
    kafka_offset,
    kafka_timestamp,
    CURRENT_TIMESTAMP
FROM parsed_events
WHERE user_id IS NULL
   OR amount IS NULL
   OR event_time IS NULL
   OR amount < 0;

END;
```

`STATEMENT SET` 会将多个 `INSERT` 作为一个 Flink Job 统一优化和执行，公共 Source 通常可以复用，避免分别启动两个 Job、重复消费同一个 Kafka Topic。

## 为什么不建议直接设置 `json.ignore-parse-errors=true`

可以这样配置：

```
'format' = 'json',
'json.ignore-parse-errors' = 'true'
```

但它更接近“容错跳过”，不是完整 DLQ。

官方文档说明，开启该参数后：

- 字段解析失败时可能被设为 `NULL`；
- 某些无法解析的行会被跳过；
- 不会自动把异常记录输出到另一张表。

例如：

```
CREATE TABLE source_table (
    user_id BIGINT,
    amount DECIMAL(18, 2)
) WITH (
    'connector' = 'kafka',
    ...
    'format' = 'json',
    'json.ignore-parse-errors' = 'true'
);
```

此时存在三个问题：

1. **可能丢失原始报文**
    
    解析之后只剩字段，原始 JSON 不一定还在。
    
2. **无法区分业务 `NULL` 和解析失败**
    
    `amount = NULL` 可能代表：
    
    - 原始字段真的为 `null`；
    - 字段不存在；
    - `"amount": "abc"` 类型错误；
    - JSON 结构不符合预期。
3. **整条 JSON 损坏时可能直接被跳过**
    
    被跳过的数据不会自动进入任何 Sink。
    

因此：

```
ignore-parse-errors = 防止作业挂掉
DLQ = 保留错误数据并可追踪、可重放
```

二者不是一个东西。

## 复杂校验：使用 UDF 返回错误信息

当校验包括以下情况时，纯 SQL 会逐渐变成 CASE WHEN 地狱：

- JSON Schema 校验；
- 多字段依赖；
- 正则与枚举校验；
- 签名校验；
- 嵌套数组校验；
- schema version 兼容；
- 一个事件可能存在多个错误原因。

此时建议写一个 ScalarFunction：

```
public class ValidateEventFunction extends ScalarFunction {

    public Row eval(String rawMessage) {
        try {
            // 1. JSON 解析
            // 2. Schema 校验
            // 3. 字段校验
            // 4. 返回解析结果和错误信息

            return Row.of(
                true,           // valid
                null,           // errorCode
                null,           // errorMessage
                parsedUserId,
                parsedAmount,
                parsedEventTime
            );
        } catch (Exception e) {
            return Row.of(
                false,
                "JSON_PARSE_ERROR",
                truncate(e.getMessage(), 1000),
                null,
                null,
                null
            );
        }
    }
}
```

注册后：

```
CREATE TEMPORARY SYSTEM FUNCTION validate_event
AS 'com.example.flink.ValidateEventFunction';
```

然后把验证结果展开：

```
CREATE TEMPORARY VIEW validated_events AS
SELECT
    raw_message,
    validation.valid,
    validation.error_code,
    validation.error_message,
    validation.user_id,
    validation.amount,
    validation.event_time,
    kafka_topic,
    kafka_partition,
    kafka_offset
FROM (
    SELECT
        *,
        validate_event(raw_message) AS validation
    FROM kafka_raw_source
);
```

生产上必须注意：

- UDF 内不要每条数据创建 `ObjectMapper`；
- 不要在 UDF 里同步请求外部 HTTP 服务；
- 异常信息要截断，避免一条错误堆栈撑爆 Kafka message；
- 不要把动态异常文本作为 Prometheus label；
- 对校验失败做指标计数和限流告警；
- 解析代码必须有单元测试、脏数据测试和 fuzz 测试。

## 哪些异常无法通过纯 SQL DLQ

并不是所有错误都能被业务 SQL 捕获。

### 可以分流到 DLQ

- JSON 字段缺失；
- 字段类型不正确；
- 时间格式错误；
- 金额非法；
- 枚举值非法；
- 业务规则校验失败；
- schema version 不支持。

### 通常无法由 SQL 行级捕获

- Kafka broker 不可用；
- checkpoint 失败；
- Sink 写入失败；
- JVM OOM；
- UDF 抛出未捕获异常；
- Connector 反序列化阶段异常；
- 状态损坏；
- 权限或网络错误。

这些属于 **作业级故障**，应该依靠：

- Flink restart strategy；
- checkpoint/savepoint；
- Kafka 重试；
- Sink 事务；
- 告警和运维处置；

而不是 DLQ。

## 架构建议

生产环境建议分成三级：

```
原始 Topic
   │
   ▼
Flink Raw Ingestion
   ├── 合法数据 ──► Clean Topic / Business Sink
   │
   └── 非法数据 ──► DLQ Topic
                         │
                         ├── 告警与统计
                         ├── 人工修复
                         └── Replay Topic
```

不要直接把 DLQ 修复消息重新写回原始 Topic，否则很容易形成：

```
原始 Topic → Flink → DLQ → 原始 Topic → Flink → DLQ
```

无限套娃，Kafka 看了都想申请年假。

更可靠的是：

```
business-source
business-dlq
business-replay
```

并在重放消息中携带：

```
{
  "original_topic": "business-source",
  "original_partition": 3,
  "original_offset": 182736,
  "retry_count": 1,
  "repair_version": "v2",
  "payload": {}
}
```

## 最终选择

|场景|实现方式|
|---|---|
|只想避免少量脏数据导致作业失败|`json.ignore-parse-errors=true`|
|必须保留脏数据并重放|Raw Format + SQL 分流|
|校验规则较复杂|Raw Format + Java UDF + Statement Set|
|必须捕获任意反序列化异常|DataStream API + ProcessFunction/侧输出流|
|SQL 和 DataStream 都要使用|DataStream 预处理后转 Table/SQL|

对生产系统，我建议直接采用：

> **Raw Kafka Source + UDF 校验 + Statement Set 双 Sink + 独立 Replay Topic**

这是可观测、可追踪、可重放且不会静默吞数据的方案。