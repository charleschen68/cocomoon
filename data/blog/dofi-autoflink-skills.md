---
title: 'dofi skills再进化，手搓一个 Flink 任务“秒级自愈”与告警系统？'
date: '2026-03-07'
tags: ['dofi', 'ai', 'BigData']
draft: false
summary: '使用dofi查看flink任务状态、容器状态、重启容器、监控flink'
images: ['static/images/avatar_bak.png']
---

今天，我将分享如何基于我的个人自动化项目 **Dofi**，打造一套**“发现故障 -> 匹配 AppID -> 自动 Savepoint 重启 -> Telegram 战报推送”**的闭环自愈系统。

---

### 一、 架构思考：为什么不用一把梭？

很多人写监控脚本，喜欢一个 Python 文件干到底：`requests` 查状态，`if failed` 就直接发 API 重启。

在真正的企业级架构中，这种“强耦合”代码是灾难。如果有 100 个任务怎么办？环境变量写 100 个 APP_ID 吗？如果 StreamPark 的接口变了怎么办？

为此，我为 Dofi 设计了**“眼-脑-手”分离的微服务架构**：

1. **👁️ 眼 (`monitor_flink.py`)**：纯粹的巡检员。每 60 秒轮询一次 Flink 1.18 的 8081 端口，只负责揪出 `FAILED` 和 `FAILING` 的任务。
2. **🧠 脑 (`job_mapping.txt`)**：动态映射表。`任务名称=APP_ID`。新增任务完全不需要改代码，只需修改文本文件，实现了极致的配置解耦。
3. **✋ 手 (`restartflinkjob.py`)**：无情的执行机器。接收 AppID，专心和 StreamPark 打交道，完成复杂的 `Cancel with Savepoint -> 阻塞等待 -> Start` 连招。

---

### 二、 实战踩坑录：那些官方文档不会告诉你的事

在打通 StreamPark (2.1.6) OpenAPI 的过程中，我踩了两个极其离谱的坑，分享给大家避雷。

#### 坑王之王 1：看似正常的 HTTP 401 Unauthorized

一开始，我用 Python 向 StreamPark 发送重启指令，死活报 401 无权限。我反复核对了 Token，甚至在 StreamPark 后台重新生成了 N 遍，依然被拒之门外。

最后，通过在 Mac 终端裸跑 `curl -i` 抓取 Header，我发现了惊天大秘密：

**在流计算平台的网关设计中，内外网接口是严格隔离的！**

- ❌ `/api/flink/app/start`：这是内部 API，认的是浏览器登录的 Session/Cookie，你喂给它 Token，它直接给你一巴掌。
- ✅ `/openapi/app/start`：这才是对外开放的 Open API！

#### 坑王之王 2：“画蛇添足”的 Bearer 前缀

绝大多数的 OAuth2.0 和 JWT 鉴权，标准的写法是： `Authorization: Bearer <你的Token>`

但是！StreamPark 的 OpenAPI 骨骼清奇，它**只认裸的 Token 字符串**。 如果你在 Python 里习惯性地加上了 `Bearer` 前缀，它会因为解析失败再次反手给你一个 401。

最终跑通的硬核 Python 代码片段如下，注意看 Header 的精简之美：

Python

```
# 必须完全对齐 charset，且剔除 Bearer 前缀
headers = {
    "Authorization": "eyJhbGciOiJIUzUxMiJ9...", # 纯 Token
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
}
# 必须使用 openapi 路径
cancel_url = "http://localhost:10000/openapi/app/cancel"
```

_(代码就是最好的证明，简洁干练，直击要害。)_

---

### 三、 丝滑体验：Telegram 里的“私人秘书”

将逻辑打通后，我将 `monitor_flink.py` 挂载在后台。现在，哪怕我正在喝咖啡，或者正在睡觉，一旦 Flink 任务发生异常，我的 Telegram 就会收到一份详尽的**自愈战报**：
![dofi加载的技能](/static/images/blog/dofi-autoflink-skills/1.png)

**文本效果演示：**

> 🚨 **[Flink 任务监控告警]** 🚨 发现 1 个任务停止运行，开始自愈流程：
>
> ⚠️ **任务离线**: `mytopic2topic1` (当前状态: FAILED) └─ 🔍 匹配到 AppID: 100002，正在调用重启模块... └─ 📝 **重启日志**: ✅ [mytopic2topic1] 停止指令成功，正在等待 Savepoint (15秒)... ✅ [mytopic2topic1] 启动指令发送成功！

看着这条消息，我默默喝了一口咖啡，不用打开电脑，任务已经满血复活了。

---

### 四、 结语

真正的自动化，不是写几个零散的脚本，而是**具备容错、解耦、自愈和消息闭环的系统工程**。

从捕捉异常状态，到查表映射 AppID，再到利用 OpenAPI 无缝触发 StreamPark 的 Savepoint 恢复机制，最后推送到 IM 工具。这套不到 300 行代码的闭环，不仅解放了我的睡眠，也让我的系统稳定性提升了一个量级。

不要做被告警支配的救火队员，要用代码让系统学会自我进化。毕竟，我们的目标是星辰大海。🚀
