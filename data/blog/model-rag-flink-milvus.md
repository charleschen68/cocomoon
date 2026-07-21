---
title: '穿透实时量化的迷雾：Flink + 大模型 + 向量检索的混合架构深度解析'
date: '2026-05-11'
tags: ['rag', 'milvus', 'model', 'flink', 'vector']
draft: false
summary: 'RM 脑裂解决方案及未来资源调度探索'
images: ['static/images/avatar_bak.png']
---

想象一下：一束束以太坊（ETH）的社交情绪数据如同脉冲信号，正以毫秒级的速度涌入 Apache Flink 引擎。

这不是普通的流处理。在这条流水线上，我们不仅要清洗数据，还要唤醒大模型进行情感分析，最后将高维度的“市场记忆”刻录进 Milvus 向量数据库，以此来寻找跨越时空的交易共鸣。

今天，我们抛开繁琐的底层网络排障，以上帝视角俯瞰这座**实时情绪量化引擎**的架构之美与代码逻辑。

---

### 🏛️ 架构全景：流、智、忆的交响乐

整个系统的数据拓扑（Topology）是一条优雅的 DAG（有向无环图），其核心逻辑可以提炼为四个阶段：

1. **感知（Source）**：从 Kafka `eth_social_stream` 实时吞吐社交媒体的原始语料。
2. **思考（LLM Async I/O）**：非阻塞式地调用本地大模型，将人类的狂热与恐慌转化为结构化的情感得分（Sentiment Score）与高维向量（Embedding）。
3. **决策（Vector Search）**：用当前的市场情绪向量，去 Milvus 中检索历史上相似的情绪切片，基于历史胜率生成交易信号（Buy/Sell/Hold）。
4. **沉淀（Sink）**：兵分两路。一路将交易信号发往下游 Kafka 供执行端消费；另一路将新的情绪切片作为“最新记忆”微批次写入 Milvus，实现引擎的自我进化。

---

### 🌊 第一乐章：主拓扑的编织（Job Pipeline）

在 `EthSentimentTradingJob` 中，我们并没有使用笨重的传统批处理思维，而是利用 Flink 的 DataStream API 编织了一张异步流转的网。

```Java
// 1. 接入 Kafka 数据源
KafkaSource<String> source = KafkaSource.<String>builder()
        .setBootstrapServers(myParameter.getKafkaUrl())
        .setTopics(myParameter.getSourceTopic())
        .setValueOnlyDeserializer(new SimpleStringSchema())
        .build();

DataStream<String> stream = env.fromSource(source, WatermarkStrategy.noWatermarks(), "SocialStream");

// 2. 异步算子链：让数据在飞驰中完成 AI 附魔
DataStream<String> sentimentStream = AsyncDataStream.unorderedWait(
        stream,
        new EthSentimentOllamaFunction(), // 呼叫大模型算子
        120, TimeUnit.SECONDS, // 大模型思考时间长，放宽超时
        50 // 异步并发度拉满
);

// 3. 兵分两路：一路去决策，一路去沉淀
DataStream<String> decisionStream = AsyncDataStream.unorderedWait(
        sentimentStream, new EthBacktestDecisionFunction(), 10, TimeUnit.SECONDS, 100);

decisionStream.sinkTo(kafkaTradeSink); // 信号下发
sentimentStream.addSink(new MilvusSink()).name("MilvusMemorySink"); // 记忆落盘
```

**架构师视角**：这里最精妙的设计在于使用了 `unorderedWait`。在处理社交数据时，晚几毫秒发出的推文先处理完并不影响大局。无序等待极大提升了算子的吞吐量，榨干了集群的并发槽位（Task Slots）。

---

### 🧠 第二乐章：驯服本地巨兽（Async I/O 与大模型）

大模型的推理是典型的 I/O 密集型/算力密集型任务。如果我们在 Flink 的 `MapFunction` 里同步调用 Qwen3，整个 TaskManager 瞬间就会被卡死，背压（Backpressure）会一路传导回 Kafka。

为了解决这个问题，`EthSentimentOllamaFunction` 采用了 **基于 NIO 的纯异步 HTTP 客户端**结合 **双重检查锁（DCL）懒加载** 的究极形态：

```Java
public class EthSentimentOllamaFunction extends RichAsyncFunction<String, String> {
    private transient volatile CloseableHttpAsyncClient httpClient;
    private transient Object lock;

    // 懒加载模式：将连接建立推迟到数据面，保证 Flink 任务秒级启动
    private void ensureClientInitialized() {
        if (httpClient == null) {
            synchronized (lock) {
                if (httpClient == null) {
                    httpClient = HttpAsyncClients.custom()
                            .setMaxConnTotal(50) // 匹配 Flink 的高并发
                            .build();
                    httpClient.start();
                }
            }
        }
    }

    @Override
    public void asyncInvoke(String input, ResultFuture<String> resultFuture) {
        ensureClientInitialized();
        // ... 组装 JSON ...

        // 发起非阻塞 HTTP 请求，把回调钩子交给底层的 Epoll Selector
        httpClient.execute(request, new FutureCallback<HttpResponse>() {
            @Override
            public void completed(HttpResponse response) {
                // 大模型回答完毕，解析得分，塞回 Flink 数据流
                resultFuture.complete(Collections.singletonList(enrichedJson));
            }
            // ... failed / cancelled 处理 ...
        });
    }
}
```

**架构师视角**：我们没有在 `asyncInvoke` 里使用 `CompletableFuture.runAsync` 另开线程池，是因为 `HttpAsyncClients` 底层自带了高效的事件循环组（Event Loop Group）。这种“纯异步化”设计，让 Flink 线程在发出网络请求后立刻返回去处理下一条数据，吞吐率拉到了极限。

---

### 💾 第三乐章：时间的刻录机（Stateful Milvus Sink）

数据最终的归宿是 Milvus 向量数据库。在这里，我们不能来一条数据就发一次 Insert 的 gRPC 请求，这不仅会打满网络带宽，还会导致 Milvus 底层的 Segment 碎片化严重。

一个工业级的 Sink，必须懂得微批次（Micro-batching）**与**状态一致性（Checkpoint Integration）的结合：

```Java
public class MilvusSink extends RichSinkFunction<String> implements CheckpointedFunction {
    private final List<JSONObject> batchBuffer = new ArrayList<>();
    private final int batchSize = 100;

    @Override
    public void invoke(String value, Context context) {
        ensureClientInitialized(); // 懒加载 Milvus 客户端

        synchronized (batchBuffer) {
            batchBuffer.add(JSON.parseObject(value));
            // 攒够 100 条，一把梭哈
            if (batchBuffer.size() >= batchSize) {
                flush();
            }
        }
    }

    // 实现 CheckpointedFunction：响应 Flink 的容错召唤
    @Override
    public void snapshotState(FunctionSnapshotContext context) {
        // 当 JobManager 发起 Checkpoint 屏障时，强制刷盘残留数据
        // 配合 Kafka 的 Exactly-Once 语义，保证向量数据不丢不重
        flush();
    }

    private void flush() {
        if (batchBuffer.isEmpty()) return;
        // ... 构建 InsertParam 批量写入 Milvus ...
        batchBuffer.clear();
    }
}
```

**架构师视角**：通过实现 `CheckpointedFunction`，我们让看似无状态的 Sink 拥有了配合 Flink 全局快照的能力。即使 Flink 节点因为宿主机资源抢占而崩溃重启，已经 Checkpoint 的数据绝不会重复写入，未刷盘的数据也会通过 Kafka 的 Offset 重放完美恢复。

---

### 🚀 结语：通往 Autonomous Agent 的基石

这套代码表面上是一条流处理 Pipeline，其内核其实是一个高度自治的 Data Agent。

大模型赋予了系统“理解”文本的能力，Milvus 赋予了系统“追溯”历史的能力，而 Flink 1.18 则是那套强劲的心血管系统，保证高并发下的血液（数据）流转不会发生心脏骤停。在这个基础之上，我们彻底摆脱了传统量化依赖 MA、RSI 等滞后指标的局限，开始用降维打击的姿态，在以太坊交易市场里寻找那些由人类贪婪与恐惧所谱写的微妙共鸣。
