---
title: 'Flink SQL 实战复盘：Kafka Connector 与 Format 选型'
date: '2026-03-14'
tags: ['flink', 'kafka', 'connector', 'format']
draft: false
summary: 'flink connector 和 format的选择和考量'
images: ['static/images/avatar_bak.png']
---

**前言** 在构建基于 Flink + Kafka + TiDB 的实时数仓链路时，我们常追求“One Source, Multi-Sink”（一源多汇）的架构极致。然而，在处理 CDC（Change Data Capture）数据流时，**Format（格式）的解析机制**与 **Connector（连接器）的写入语义**往往存在微妙的耦合。今天记录一下在生产环境中遇到的几个经典“坑”，以及背后的架构权衡。

## 一、 架构优化：Statement Set 实现“一次读取，多次写入”

**场景**： 我们需要消费一个 Kafka Source（Canal 格式），同时将数据分发给 TiDB（用于业务查询）和两个 Kafka Topic（分别用于风控和审计）。

**误区**： 初学者容易创建三个 Source 表来分别对应三个 Sink。这会导致 Flink 开启三个独立的 Consumer Group，造成 3 倍的网络 I/O 和序列化开销。

**最佳实践**： 利用 Flink SQL 的 `STATEMENT SET` 特性（在 Dinky/StreamPark 等平台中通常隐式支持），我们在一个 Job 中定义一个 Source 和多个 Sink。Flink 会自动构建 DAG，复用 Source 节点，实现流量的复用与分发。

_(配图建议：贴上你成功的 Flink Job Graph，显示一个 Source 节点分叉出多个 Sink 节点)_

## 二、 格式之争：`canal-json` vs `json` 的致命误解

**踩坑现场**： 在定义 Source DDL 时，我需要手动解析 Canal 中的元数据（如 `database`, `table`, `ts`）以及手动处理 `data` 数组的 `UNNEST` 操作。起初我习惯性使用了 `format = 'canal-json'`，结果任务启动后 **Records Sent 为 0**，数据全被静默丢弃。

**深度解析**： 这是对 Flink Format 机制的理解偏差。

- **`canal-json`**：是 Flink 的**自动驾驶模式**。它会自动剥离外层的信封（Envelope），直接将变更应用到下游。如果你在 DDL 里显式定义了 `data` 或 `type` 字段，Flink 拆包后发现字段对不上（因为外层已经被剥离了），就会解析失败。
- **`json`**：是**手动挡模式**。Flink 把它当作普通 JSON 处理。如果你需要获取 `op_type` 来做自定义过滤（比如只取 `INSERT`），或者需要手动 `UNNEST` 数组，**必须使用 `json` 格式**。

**代码修正**：

```sql
CREATE TABLE source_table (
    `data` ARRAY<ROW<...>>,
    `type` STRING,
    ...
) WITH (
    'connector' = 'kafka',
    'format' = 'json',  -- 关键修正：改为 json 以便手动解析
    'json.ignore-parse-errors' = 'true'
);
```

**架构权衡**： 改为 `json` 后，我们失去了 Flink 内置的 Changelog 解析能力（即无法自动处理 DELETE）。这意味着下游如果使用 `upsert-kafka`，由于无法识别 DELETE 事件，物理删除将退化为“软删除”（Soft Delete，即 Kafka 中保留一条 `type: DELETE` 的记录）。对于 ODS 层或审计层，保留所有痕迹通常是更优的选择。

## 三、 Upsert-Kafka 的“重复数据”假象

**现象**： 当 Source 切换为 `json` 格式并写入 `upsert-kafka` Sink 时，我在 Kafka Tool 中发现同一个主键（Key）竟然存在多条记录。第一反应是：“Upsert 没生效？数据重复了？”

_(配图建议：贴上你提供的 Kafka Tool 预览图，展示相同的 ID 出现多次)_

**技术定论**： 这是对 Kafka **Log Compaction** 机制的误读。 Kafka 本质是 **Append-only Log**（追加日志）。`upsert-kafka` 的“更新”在物理底层就是追加一条新消息。

- **Offset 0**: `{id: 100, status: "created"}`
- **Offset 1**: `{id: 100, status: "paid"}`

我们在 Kafka 预览中看到的“重复”，实则是数据的**版本历史**。只要下游 Flink 任务同样使用 `upsert-kafka` 读取，它会自动合并状态，只保留最新的 View。这正是流计算中 **"State"（状态）** 与 **"Log"（日志）** 的辩证关系。

## 四、 细节避坑：时间戳转换

    在 Flink 1.15+ 中，`UNIX_TIMESTAMP()` 函数不再支持直接接收 `TIMESTAMP` 类型。 **报错**：`Cannot apply 'UNIX_TIMESTAMP' to arguments of type 'UNIX_TIMESTAMP(<TIMESTAMP(6)>)'` **解法**：直接利用类型强转，性能更佳。

```sql
-- 错误写法
UNIX_TIMESTAMP(created_at)
-- 正确写法 (获取毫秒级时间戳)
CAST(created_at AS BIGINT)
```

## 总结

大数据开发不仅是写 SQL，更是对流式语义的精准把控。

1. **分流**：用 Statement Set 榨干 Source 性能。
2. **格式**：想手动控制逻辑（如只看 INSERT），请用 `json`；想自动同步状态，用 `canal-json`。
3. **存储**：理解 Kafka 的追加写特性，不要被物理层面的“多版本”迷惑。
