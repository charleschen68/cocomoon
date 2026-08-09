---
title: 'GitOps Big Data Platform'
date: '2026-07-24'
tags: ['GitOps', 'Kubernetes', 'Kustomize', 'ArgoCD', 'SOPS', 'Velero', 'BigData']
draft: false
summary: 'A GitOps environment repository managing a big data platform on k3s with Kustomize, ArgoCD, SOPS encryption, and Velero disaster recovery.'
images: ['static/images/avatar_bak.png']
---

# 用 GitOps 管理大数据平台：从环境声明到生产就绪

在 Kubernetes 上运行大数据平台时，随着组件不断增加（Kafka、Flink、MySQL、MinIO、Prometheus、Grafana…），环境管理的复杂度会呈指数增长。配置文件散落各处、Secrets 明文存储、灾备流程依赖人工——这些问题在平台规模扩大后会逐一暴露。

本文介绍我们是如何用一个 GitOps 环境仓库来解决这些问题的。整个仓库只有三个提交，但覆盖了从环境声明、加密管理到灾备演练的完整生命周期。

## 1. 核心架构

整个平台运行在 k3s 上，包含五个命名空间：

| 命名空间        | 职责          | 关键组件                                                        |
| --------------- | ------------- | --------------------------------------------------------------- |
| `gitops`        | GitOps 控制面 | ArgoCD（Application Controller + Repo Server + ApplicationSet） |
| `data`          | 数据存储层    | Kafka、MySQL、MinIO                                             |
| `flink`         | 流处理引擎    | Flink、交易信号处理                                             |
| `collectors`    | 数据采集      | 各类数据采集器                                                  |
| `observability` | 可观测性      | Prometheus、Grafana、告警通知                                   |

每个命名空间对应一个 ArgoCD Application CR，通过 `syncPolicy` 实现自动化同步和自我修复：

```yaml
# environments/current/applications/flink.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: flink
  namespace: gitops
spec:
  source:
    repoURL: https://github.com/ad/big-data-platform-envs.git
    targetRevision: HEAD
    path: environments/current/overlays/flink
  destination:
    server: https://kubernetes.default.svc
    namespace: flink
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

关键点：

- **`prune: true`** — 自动清理 Git 中已删除的资源
- **`selfHeal: true`** — 自动修复偏离声明的集群状态
- **`CreateNamespace: true`** — 首次部署时自动创建命名空间

ArgoCD 自身也托管在这个仓库中（`gitops-self` Application），形成了**自举（bootstrapping）**模式：仓库即唯一事实来源，ArgoCD 既是管理者也是被管理者。

## 2. 环境声明：Kustomize 为核心

我们选择 Kustomize 而非 Helm 作为环境声明工具，原因很直接：

1. **无模板语言** — Kustomization.yaml 是纯 YAML，不需要学习 Go template 语法
2. **覆盖（overlay）模型** — 每个组件一个 overlay，通过 `kustomization.yaml` 组合
3. **与 ArgoCD 天然契合** — ArgoCD 原生支持 Kustomize 路径引用

```
environments/current/
├── kustomization.yaml          # 根声明，引用所有 Application CR
├── applications/               # ArgoCD Application CRs
│   ├── gitops.yaml             # ArgoCD 自举
│   ├── data.yaml               # 数据层
│   ├── flink.yaml              # Flink 流处理
│   ├── collectors.yaml         # 采集器
│   └── observability.yaml      # 可观测性
├── secrets/                    # SOPS 加密的 Secrets
│   ├── kustomization.yaml
│   ├── kafka-secrets.sops.yaml
│   ├── mysql-secrets.sops.yaml
│   └── minio-secrets.sops.yaml
└── overlays/                   # Kustomize overlays
    ├── data/
    ├── flink/
    ├── collectors/
    ├── observability/
    ├── argocd-values.yaml      # ArgoCD Helm values 覆盖
    └── velero-values.yaml      # Velero Helm values 覆盖
```

根 `kustomization.yaml` 简洁地声明了所有资源：

```yaml
resources:
  - applications/gitops.yaml
  - applications/data.yaml
  - applications/flink.yaml
  - applications/collectors.yaml
  - applications/observability.yaml
  - secrets/kustomization.yaml
```

## 3. Secrets 管理：SOPS + age

Secrets 是我们最关注的问题之一。明文存储密码和密钥是常见但危险的做法。我们选择了 SOPS（Secrets OPerationS）配合 age 加密：

```yaml
# .sops.yaml
creation_rules:
  - path: \.sops\.yaml
    encrypted_regex: '^(data|stringData)$'
    age: 'age17mvxx3fjdx3k40ycajr5wakumf2vklxqtw68xw3u2eukqwmyf3zqff66ak'
```

每个 Secret 文件都包含加密数据和 SOPS 元数据：

```yaml
# secrets/kafka-secrets.sops.yaml
apiVersion: v1
kind: Secret
metadata:
  name: kafka-secrets
  namespace: data
type: Opaque
stringData:
  KAFKA_USERNAME: ENC[AES256_GCM,data:597IHUkaaWXnhA==,iv:...,tag:...
  KAFKA_PASSWORD: ENC[AES256_GCM,data:tHFzh3c4bwwixJTFNEA=,iv:...,tag:...
  KAFKA_BOOTSTRAP_SERVERS: ENC[AES256_GCM,data:YlSwr+zUZeTfHIuwZgzT...
sops:
  age:
    - enc: |
        -----BEGIN AGE ENCRYPTED FILE-----
        ...
  encrypted_regex: ^(data|stringData)$
  version: 3.13.3
```

加密策略：

- **`encrypted_regex: "^(data|stringData)$"`** — 只加密值，不加密键名，保持可读性
- **age 加密** — 比 PGP 更轻量，密钥管理更简单
- **Kustomize secretGenerator** — 通过 `files` 引用 `.sops.yaml` 文件，ArgoCD 推送时自动解密

使用脚本加密和解密：

```bash
./scripts/sops-encrypt.sh secrets/my-secret.yaml
./scripts/sops-decrypt.sh secrets/my-secret.sops.yaml
```

## 4. 灾备：Velero + MinIO

大数据平台的可用性不仅取决于日常运行的稳定性，更取决于灾难发生时的恢复能力。我们使用 Velero 实现集群级备份和恢复：

```yaml
# overlays/velero-values.yaml
backupLocation:
  name: minio
  config:
    region: minio
    s3ForcePathStyle: 'true'
    s3Url: http://minio.data.svc.cluster.local:9000

schedules:
  daily-backup:
    disabled: false
    schedule: '0 3 * * *' # 每天凌晨 3 点
    template:
      ttl: '720h' # 保留 30 天
      includeNamespaces:
        - data
        - flink
        - collectors
        - observability
        - gitops
```

关键设计决策：

- **备份目标使用集群内 MinIO** — 不依赖外部 S3，减少外部依赖
- **全命名空间覆盖** — 5 个命名空间全部纳入备份
- **自动化定时备份** — Velero CronJob 每天凌晨执行

灾备脚本提供了三种恢复场景：

```bash
# 常规恢复
./scripts/velero-restore.sh <backup-name>

# 完整灾备（模拟集群完全丢失）
./scripts/velero-disaster-recovery.sh <backup-name>

# 验证恢复
./scripts/verify-recovery.sh
```

## 5. 毕业演练（Graduation Drills）

一个系统是否达到生产标准，不看日常运行，看异常表现。我们设计了三种毕业演练：

### 5.1 VM 重启恢复

模拟 k3s 所在 VM 意外断电重启：

1. VM 重启
2. k3s 自动启动
3. ArgoCD 同步所有 Application
4. 所有 Pod 启动
5. 采集器重新连接 Kafka
6. Flink 从 savepoint 恢复
7. 交易信号无重复

### 5.2 Ollama 容错

模拟 Ollama 服务中断 10 分钟：

1. 停止 Ollama（macOS host 层面）
2. 验证 Flink 异步函数的超时和背压处理
3. 验证 Prometheus 告警触发
4. 验证 Telegram 通知发送
5. 重启 Ollama

### 5.3 灾难恢复

模拟整个集群丢失：

1. 从 Velero 备份恢复
2. 验证 PVC 数据恢复
3. 验证 etcd 数据恢复
4. 验证 ArgoCD 同步
5. 验证全系统可用性

## 6. 实践总结

这个环境仓库虽然不大，但体现了一些值得坚持的实践：

**单一事实来源** — 所有环境状态都声明在 Git 仓库中，`git diff` 就能看到变更影响。

**加密即代码** — SOPS 加密的 Secrets 可以直接提交到 Git，不需要额外的 Vault 或 SealedSecrets。

**自动化优于手动** — 从日常同步（ArgoCD automated sync）到定时备份（Velero cron），再到灾备脚本（一键恢复），手动操作被压缩到最小。

**演练验证生产就绪** — 三种毕业演练覆盖了从日常异常（VM 重启）到服务中断（Ollama）再到完全丢失（灾备）的不同场景。

## 7. 结语

管理大数据平台的环境配置，本质上是在**复杂度**和**可控性**之间找平衡。Kustomize 提供了简洁的环境声明，ArgoCD 提供了自动化部署和自我修复，SOPS 解决了加密问题，Velero 兜底了灾备。

这个仓库的价值不在于引入了多少新技术，而在于用最少的基础设施组合，构建了一个从日常运行到灾难恢复的完整闭环。
