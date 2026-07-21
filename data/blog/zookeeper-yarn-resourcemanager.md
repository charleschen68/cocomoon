---
title: '惊魂时刻：当两台 ResourceManager 决定一起“摆烂”——记一次 YARN HA 故障排查与架构演进'
date: '2026-05-10'
tags: ['zookeeper', 'resourcemanager', 'yarn']
draft: false
summary: 'RM 脑裂解决方案及未来资源调度探索'
images: ['static/images/avatar_bak.png']
---

在分布式系统的世界里，最怕的不是节点宕机，而是节点们突然拥有了“思想”，并决定集体罢工。最近，我们就经历了一场让人血压飙升的集群大罢工：两台承担着全局资源调度重任的 YARN ResourceManager (RM) 竟然同时进入了 Standby（备用）状态，导致 `8032` 核心通信端口彻底静默，整个大数据集群瞬间失去了“大脑”。

这是一份来自故障一线的复盘报告，记录了我们如何从一团乱麻的日志中抽丝剥茧，不仅修好了集群，还顺手给它的架构升了个级。

---

## 🛠️ 故障档案：案发现场的离奇现象

**问题记录：**

- **现象：** 集群突然无法提交新任务，旧任务也失去响应。检查发现两台 ResourceManager 全部处于 Standby 状态。
- **初步尝试：** 尝试使用 `yarn rmadmin -transitionToActive rm1 --forceactive` 强行“黄袍加身”，结果 RM1 闪退回 Standby，死活不肯上位。重启服务后，依然是“双双躺平”的死循环。
- **附带伤害：** 最终通过强制手段重启 YARN 恢复了服务，但代价惨痛——集群上正在运行的所有 Flink 和 Spark 任务全部崩溃，对业务造成了直接影响。

---

## 🔍 顺藤摸瓜：日志里的“不在场证明”

为什么强行指定 Active 都不管用？真正的答案藏在 RM 的底层运行日志中。通过实时追踪，我们捕获到了主备切换器（`ActiveStandbyElector`）崩溃前的绝望呼喊：

1. `Old node exists: 0a067961...` —— 选举器在 Zookeeper (ZK) 中发现了一个“前朝遗老”（残留的旧 Active 节点记录）。
2. `Writing znode /yarn-leader-election/yarnRM/ActiveBreadCrumb...` —— 现任节点试图强行写入自己的“面包屑”，宣告接管。
3. `WARN ... Exception handling the winning of election` —— **致命一击！** 在接管的最后一刻，由于读取/覆盖旧节点时发生版本冲突或权限异常，选主逻辑直接崩溃。

**真相大白：** 这不是 RM 坏了，而是在某次异常（如断电、网络剧烈抖动或强杀进程）后，上一个 Active RM 没来得及在 ZK 里擦除自己的痕迹。新上任的 RM 面对这块“脏数据”不知所措，抛出异常后主动切断了与 ZK 的连接，从而陷入了无限重试的死循环。

---

## 🧠 架构迷思：为什么偶数个节点没有“脑裂”？

在排查过程中，我们曾产生过一个经典的架构疑问：**只有两台 RM，是不是很容易发生“脑裂”（Split-Brain）？如果是偶数台，是不是更容易出问题？**

这里必须澄清一个分布式系统的核心认知谬误：**在 YARN 的架构中，RM 本身根本没有投票权。**

- **仲裁者与打工人：** 像 Zookeeper 这样的“仲裁系统”，依靠 Paxos/ZAB 等共识协议投票选主，它们**必须是奇数**（3, 5, 7），否则偶数台在网络分区时确实无法达成多数派。但 RM 只是“计算/调度节点”，它们决定谁是老大的方式，是去 ZK 里抢同一把锁。
- **因祸得福的 Fencing：** 事实上，我们遇到的这个报错，正是 YARN 完美的防脑裂机制（Fencing）在起作用！当 RM 发现 ZK 里的“面包屑”信息跟自己对不上时，它宁愿抛出异常自杀（退回 Standby），也绝不带着错误的状态去瞎指挥。**它是以牺牲“可用性”为代价，保全了数据和状态的“强一致性”。**

---

## 🗡️ 破局之法：物理超度脏数据

既然知道了是 ZK 里的脏数据作祟，解决办法就非常暴力且优雅了。得益于 Zookeeper 的 ZAB 强一致性协议，我们不需要挨个节点去改，只需找准病灶，一刀切除。

**修复步骤：**

1. 在 Cloudera Manager (CM) 中先让这两台“冥顽不灵”的 RM 停机休息。
2. 登录任意一台 ZK 节点，进入客户端：`zkCli.sh -server localhost:2181`
3. 对准日志暴露的真实选举路径，执行物理超度：

   Bash

   ```
   deleteall /yarn-leader-election/yarnRM
   ```

4. 在 CM 中重新启动两台 RM。它们面对干净的 ZK 环境，终于能够心平气和地完成公平选举，一台顺利 Active，一台乖乖 Standby。

---

## 🚀 架构重塑：从“进程级 HA”走向“状态级 HA”

虽然集群恢复了，但业务任务因为 YARN 重启而全盘崩溃的惨痛教训，暴露出当前集群一个巨大的架构隐患：**我们只做了选主的高可用，却没做状态的高可用。**

为了确保下次即使直接 `kill -9` 拔掉 Active RM 的网线，线上的流处理任务也能稳如泰山，我们实施了终极的架构升级：

**1. 启用高可用状态存储 (State Store)** 不再让 RM 把任务的元数据记在容易丢失的内存里，而是强制持久化到高可用的 ZK 中：

- `yarn.resourcemanager.recovery.enabled` = `true`
- `yarn.resourcemanager.store.class` = `ZKRMStateStore`

**2. 开启工作保留恢复 (Work-Preserving Recovery)** 这才是真正的救命稻草：

- `yarn.resourcemanager.work-preserving-recovery.enabled` = `true` 配置生效后，当新 RM 上任时，它会先去 ZK 里读取前任留下的任务状态，然后淡定地等待各个 NodeManager 汇报当前正在运行的 Container。只要 Container 没死，RM 就能在内存中把整个集群的运行画面重新拼接起来。**整个切换过程，上层业务完全无感知。**

---

## 💡 行业延伸：资源调度的未来

解决完眼前的问题，抬眼望去，Hadoop YARN 虽然依然是传统大数据底座的中流砥柱，但资源调度的江湖早已暗流涌动。

如果你对这种极致的弹性和高可用感兴趣，行业内领先的趋势正在向 **云原生与 Kubernetes (K8s) 统一调度** 倾斜。例如：

- **Apache YuniKorn**：专为 K8s 设计的大数据批处理调度器，完美继承了 YARN 的多租户、队列配额管理，但去掉了 YARN 笨重的组件。
- **Volcano**：不仅能跑大数据，还能跑 AI 训练任务的高性能 K8s 批处理调度系统。

故障是架构进化的最佳催化剂。下一次如果再遇到集群罢工，我们就不只是去删 ZK 节点了，也许就是直接在 K8s 上拉起一个崭新的调度 Pod 见证云原生的魔法了。
