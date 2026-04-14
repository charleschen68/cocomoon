---
title: 'Flink SQL CDC 实战：从报错连连到实时同步成功'
date: '2026-04-14'
tags: ['flinkcdc', 'flink', 'streampark', 'mysql']
draft: false
summary: 'flinkcdc 示例代码'
images: ['static/images/avatar_bak.png']
---

在实时数仓的构建中，Flink CDC 凭借其无需中间件、性能强劲的特性，成为了数据库增量同步的热门方案。

本文将复盘一次从“建表”到“报错”再到“成功”的完整过程。

## 一、 核心架构：MySQL 到 MySQL 的同步

我们的目标是将订单数据（`orders`）实时同步到镜像库（`orders_sink`）。

### 1. SQL 准备

在 Flink SQL 中，我们需要定义 **Source（源）** 和 **Sink（目的）** 两张表：

SQL

```
-- Source 表：使用 mysql-cdc 连接器
CREATE TABLE flink_cdc_orders (
    order_id INT,
    customer_name STRING,
    product_name STRING,
    price DECIMAL(10, 2),
    order_status STRING,
    create_time TIMESTAMP(3),
    PRIMARY KEY (order_id) NOT ENFORCED
) WITH (
    'connector' = 'mysql-cdc',
    'hostname' = '192.168.1.10',
    'port' = '3306',
    'username' = 'root',
    'password' = 'password',
    'database-name' = 'e_commerce',
    'table-name' = 'orders'
);

-- Sink 表：使用 jdbc 连接器
CREATE TABLE sink_orders (
    order_id INT,
    customer_name STRING,
    product_name STRING,
    price DECIMAL(10, 2),
    order_status STRING,
    create_time TIMESTAMP(3),
    PRIMARY KEY (order_id) NOT ENFORCED
) WITH (
    'connector' = 'jdbc',
    'url' = 'jdbc:mysql://192.168.1.10:3306/target_db',
    'table-name' = 'orders_sink',
    'username' = 'root',
    'password' = 'password'
);

-- 执行同步
INSERT INTO sink_orders SELECT * FROM flink_cdc_orders;
```

---

## 二、 排查思路：那些年踩过的坑

在 StreamPark 提交任务后，我们通常会遇到以下三个阶段的报错。

### 阶段 1：缺少 Kafka 核心类

**报错现象：**

> `java.lang.ClassNotFoundException: org.apache.kafka.connect.source.SourceRecord`

- **排查思路**：明明没用 Kafka，为什么报 Kafka 的错？
- **真相分析**：Flink CDC 底层封装了 **Debezium** 框架，而 Debezium 又是基于 Kafka Connect 运行的。如果你使用的是“薄包”（只有逻辑代码，没有依赖类），Flink 就会因为找不到 Kafka 基础类而崩溃。
- **对策**：必须引入 `flink-sql-connector-mysql-cdc`（注意带 **sql** 字样的胖包）。

### 阶段 2：内部工具类缺失

**报错现象：**

> `java.lang.NoClassDefFoundError: com/ververica/cdc/debezium/utils/ResolvedSchemaUtils`

- **排查思路**：明明上传了 Jar 包，为什么还是找不到 CDC 内部的工具类？
- **真相分析**：
  1. **版本冲突**：StreamPark 的 POM 依赖中声明了 3.x 版本，但上传的 Jar 包是 2.x 版本。
  2. **依赖加载优先级**：Flink 的类加载器加载了错误的 Base 包。
- **对策**：**“清理并统一版本”**。移除所有 POM 声明，统一使用官方提供的单一“胖包”（Shaded Jar），如 `flink-sql-connector-mysql-cdc-2.4.2.jar`。

---

## 三、 终极解决方案（避坑 Checklist）

如果你也遇到了类似报错，请按照以下步骤自查：

1. **包的选择**：优先使用 `flink-sql-connector-xxx.jar`（胖包），而不是 Maven 中央仓库默认的 thin 包。
2. **版本匹配**：
   - Flink 1.15/1.16/1.17 -> 推荐使用 **CDC 2.4.2**（单包即用，最稳）。
   - Flink 1.18+ -> 可以尝试 CDC 3.0+（但配置较复杂）。

3. **StreamPark 配置清理**：
   - **Dependency**：清空所有 Maven 代码，通过 **Resource Management** 上传 Jar 包并勾选。

4. **MySQL 配置**：确保开启了 Binlog，且权限足够（`REPLICATION SLAVE`, `REPLICATION CLIENT`）。

## 四、 结语

Flink SQL CDC 的配置难点不在于 SQL 语法，而在于 **运行环境的依赖对齐**。通过 StreamPark 配合官方 Shaded 胖包，并针对 JDK 版本补全反射权限，可以解决 90% 以上的启动报错。

> **提示**：如果在生产环境运行，请务必在 SQL 中开启 `scan.incremental.snapshot.enabled` 以支持大表的无锁增量扫描。
