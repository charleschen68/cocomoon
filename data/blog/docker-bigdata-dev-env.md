---
title: '告别“重装”噩梦：基于 Docker + StreamPark 构建极致的本地实时大数据开发环境'
date: '2026-03-02'
tags: ['Docker', 'Flink', 'StreamPark', 'BigData']
draft: false
summary: '通过极致的资源配额与容器化编排，将原本繁琐的大数据环境搭建压缩至秒级，大幅提升实时计算开发的人效比。'
images: ['static/images/avatar_bak.png']
---

## 前言

作为大数据开发者，我们痛恨环境搭建。要在本地笔记本上跑通一套包含 Kafka、Flink、MySQL 且带有监控的实时计算环境，往往意味着安装一堆 JDK 版本、配置 Zookeeper、解决端口冲突，稍微不慎电脑风扇就开始呼啸。

今天分享一套我经过多次迭代优化的 `docker-compose.yml` 配置。这是一套专为 **MacBook (M系列芯片)** + **OrbStack** 优化的方案，核心目标是：**轻量、可观测、数据持久化、开发体验丝滑**。

## 架构概览

我们将构建一个包含以下组件的闭环生态：

- **计算核心**：Flink 1.18 (Standalone Session Cluster)
- **管理控制台**：StreamPark 2.1.6 (任务提交、依赖管理)
- **消息总线**：Kafka 3.7.0 (KRaft 模式，去 Zookeeper)
- **存储层**：MySQL 8.0 (元数据存储)
- **可观测性**：Prometheus + Grafana + cAdvisor (容器监控)
- **开发环境**：DevContainer (统一开发底座)

---

## 核心选型与配置考量

### 1. Kafka 去“Z”化 (KRaft Mode)

在本地开发中，Zookeeper 往往是“内存刺客”。

- **选型**：使用 Kafka 3.7.0 的 **KRaft 模式**。
- **优点**：移除 Zookeeper 依赖，减少一个容器，至少节省 512MB 内存，启动速度更快。
- **配置亮点**：
  - **内存精细控制**：显式设置 `KAFKA_HEAP_OPTS: "-Xmx1G"`。Kafka 极其依赖 Page Cache，我们限制堆内存，把更多物理内存留给操作系统层面的缓存。
  - **刷盘策略权衡**：
    YAML
    ```
    # 牺牲一点性能，换取本地开发的数据安全性
    KAFKA_LOG_FLUSH_INTERVAL_MS: 10000
    ```
    生产环境通常由 OS 决定刷盘，但在本地如果不小心重启容器，数据可能会丢。这里强制 10s 刷盘，平衡了性能与数据安全。

### 2. StreamPark：打通本地与容器的“任督二脉”

StreamPark 是这套环境的“大脑”，也是配置最复杂的地方。

- **痛点**：Docker 里的 StreamPark 经常找不到 Flink 环境，或者编译太慢。
- **解决方案**：
  - **挂载物理引擎**：
    YAML
    ```
    - ./flink-1.18.1:/opt/flink
    ```
    我们没有使用镜像内置的 Flink，而是将宿主机下载好的 Flink 完整包挂载进去。这样做的好处是，你可以随时在宿主机修改 `flink-conf.yaml`，容器内立即生效，无需重打镜像。
  - **挂载 Maven 仓库**：
    YAML
    ```
    - ~/.m2:/root/.m2
    ```
    **这一步至关重要！** 它让容器复用宿主机的 Maven 缓存。否则每次在 StreamPark 提交作业，容器都要重新下载半天 Jar 包。
  - **Docker Socket 透传**：挂载 `/var/run/docker.sock`，让 StreamPark 有能力动态启动新的 Flink 任务容器。
    ![StreamPark：打通本地与容器的“任督二脉”](/static/images/blog/docker-bigdata-dev-env/1.png)

### 3. 资源隔离与限制 (防雪崩)

在 MacBook 上跑大数据全家桶，最怕 Chrome 和 IDE 抢不到资源卡死。

- **策略**：利用 Docker Compose 的 `deploy.resources.limits`。
  - **Kafka**：限制 2GB (足够吞吐)。
  - **Flink TM**：限制 4GB (给状态后端和计算留足空间)。
  - **MySQL**：限制 1GB (元数据存储不需要太大)。
- **收益**：确保即使 Flink 任务发生 OOM，也只是容器挂掉，不会导致宿主机系统崩溃。

### 4. 完整的监控体系

为什么本地开发要上监控？因为我们要**看见**反压。

- **组合**：cAdvisor (采集容器指标) + Prometheus (存储) + Grafana (展示)。
- **用途**：
  - 当你怀疑代码有内存泄漏时，看 Grafana 的内存曲线。
  - 当任务处理不过来时，看 CPU 使用率是否被限制住了。
    ![StreamPark：打通本地与容器的“任督二脉”](/static/images/blog/docker-bigdata-dev-env/2.png)

---

## 完整配置清单 (`docker-compose.yml`)

```
services:
# --- [开发容器] ---
  dev-runner:
    build:
      context: .devcontainer
      dockerfile: Dockerfile
    container_name: dev-box           # 域名: dev-box.orb.local
    volumes:
      - .:/workspace:cached
      - ~/.ssh:/root/.ssh:ro
    command: sleep infinity
    network_mode: service:kafka

  # --- 1. Apache Kafka (KRaft模式) ---
  kafka:
    image: apache/kafka:3.7.0
    restart: on-failure  # 只要容器停了，就无限重启  no: 默认值。   on-failure: 只有在非正常退出（比如报错、OOM）时才重启（适合消费者程序）。
    container_name: kafka
    ports:
      - "9092:9092"
      - "9094:9094"
    environment:
      PATH: "/opt/kafka/bin:${PATH}"
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093,EXTERNAL://:9094
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,EXTERNAL://kafka.orb.local:9094
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,EXTERNAL:PLAINTEXT

      # 牺牲性能：在生产环境的多副本集群中，我们通常不建议设置这两个值，而是依赖副本复制来保证数据不丢失
      # 策略 A：每收到 10000 条消息，就强制刷写一次磁盘
      # 默认是 Long.MAX_VALUE (完全交给操作系统，不安全)
      # KAFKA_LOG_FLUSH_INTERVAL_MESSAGES: 10000
      # 策略 B：每隔 1000 毫秒（1秒），就强制刷写一次磁盘
      # 默认是 null (完全交给操作系统)
      KAFKA_LOG_FLUSH_INTERVAL_MS: 10000

      # 显式设置堆内存为 1GB。
      # 剩下 1GB 留给 Docker 容器内的操作系统、Page Cache 和堆外内存。
      KAFKA_HEAP_OPTS: "-Xmx1G -Xms1G"

    deploy:
      resources:
        limits:
          cpus: '0.50'    # 限制最多使用 50% 的单核 CPU 能力
          memory: 2048M    # 限制最多使用 512MB 内存
    volumes:
      # 【关键】持久化 Kafka 的消息日志和 Topic 信息
      - ./data/kafka:/bitnami/kafka/data

  # --- 3. Flink JobManager ---
  flink-jobmanager:
    user: root
    image: flink:1.18
    container_name: flink-jobmanager
    ports:
      - "8081:8081"
    command: jobmanager
    volumes:
      - ./flink-data/checkpoints:/opt/flink/checkpoints
      - ./flink-data/savepoints:/opt/flink/savepoints
      - ./flink-data/usrlib:/opt/flink/usrlib

      # 【关键】JobManager 也需要访问 Checkpoints 目录来恢复任务
      - ./data/flink_checkpoints:/flink_checkpoints
      # 如果需要上传 jar，可能也需要映射
      - ./data/flink_uploads:/opt/flink/usr
    environment:
      - |
        FLINK_PROPERTIES=
        jobmanager.rpc.address: flink-jobmanager
        rest.address: 0.0.0.0
        rest.bind-port: 8081
        parallelism.default: 1
        execution.checkpointing.interval: 10000
        execution.checkpointing.mode: EXACTLY_ONCE
        state.backend: hashmap
        state.checkpoints.dir: file:///opt/flink/checkpoints
        state.savepoints.dir: file:///opt/flink/savepoints
    deploy:
      resources:
        limits:
          memory: 1536M    # 限制最多使用 512MB 内存

  # --- 4. Flink TaskManager ---
  flink-taskmanager:
    user: root
    image: flink:1.18
    restart: on-failure:5 # on-failure:5  # 👈 如果是因为代码逻辑错误导致的崩溃 尝试重启最多 5 次，如果还不行就算了
    container_name: flink-taskmanager
    depends_on:
      - flink-jobmanager
    command: taskmanager
    volumes:
      - ./flink-data/checkpoints:/opt/flink/checkpoints
      - ./flink-data/savepoints:/opt/flink/savepoints
      - ./flink-data/usrlib:/opt/flink/usrlib
    scale: 1
    environment:
      - |
        FLINK_PROPERTIES=
        jobmanager.rpc.address: flink-jobmanager
        taskmanager.numberOfTaskSlots: 4
        taskmanager.memory.process.size: 3072m
    deploy:
      resources:
        limits:
          memory: 4096M    # 限制最多使用 4096MB 内存

  # --- 5. MySQL ---
  mysql:
    image: mysql:8.0
    container_name: streampark-db
    platform: linux/amd64
    environment:
      MYSQL_ROOT_PASSWORD: streampark
      MYSQL_DATABASE: streampark
    volumes:
      # 【关键】把 Mac 的 ./data/mysql 目录映射到容器内的 /var/lib/mysql
      - ./data/mysql:/var/lib/mysql
    ports:
      - "3306:3306"
    deploy:
      resources:
        limits:
          memory: 1024M    # 限制最多使用 512MB 内存

# --- 6. StreamPark ---
  streampark:
    user: root
    image: apache/streampark:2.1.6
    platform: linux/amd64
    container_name: streampark
    ports:
      - "10000:10000"
    # 修复点：以下所有配置必须缩进，要在 streampark 内部
    env_file: .env
    environment:
      # 告诉 StreamPark 去哪里找 Flink
      - FLINK_HOME=/opt/flink
    depends_on:
      - mysql
      - flink-jobmanager
      - kafka
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ~/.kube:/root/.kube
      # 【核心修改】挂载完整的 Flink 引擎
      # 这里的 ./flink-dist 是我们上一轮讨论中从容器里拷出来的，或者是你下载解压的 flink-1.18.1
      # 请根据你实际存在的目录名修改（如果是拷出来的就用 flink-dist，下载的就用 flink-1.18.1）
      - ./flink-1.18.1:/opt/flink

      # 【保留】你的自定义 Jar 包 (这是子挂载，会覆盖进 /opt/flink/usrlib)
      - ./flink-data/usrlib:/opt/flink/usrlib

      # 1. 持久化 Docker socket (为了让 StreamPark 能启动 Flink 容器)
      - /var/run/docker.sock:/var/run/docker.sock
      # 2. 【关键】持久化你的工作空间（上传的 Jar 包、构建的代码）
      - ./data/streampark_workspace:/streampark/workspace
      # 3. 【关键】挂载本地的 Maven 仓库（可选，但强烈建议，加速编译）
      - ~/.m2:/root/.m2
      # 4. 【关键】挂载 Flink Checkpoints 目录（为了数据容错）
      - ./data/flink_checkpoints:/flink_checkpoints
    # deploy:
      # resources:
      #   limits:
      #     cpus: '0.50'    # 限制最多使用 50% 的单核 CPU 能力
      #     memory: 2048M    # 限制最多使用 2048MB 内存

# 可视化监测面板 start
# 1. 监控数据采集器
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0     # 使用较新版本支持 Mac (M1/M2 可能需要特定镜像，如果是 Intel 芯片用这个即可)
    container_name: monitoring-cadvisor
    privileged: true
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8080:8080"

  # 2. 监控数据库
  prometheus:
    image: prom/prometheus:latest
    container_name: monitoring-prometheus
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
    depends_on:
      - cadvisor

  # 3. 监控仪表盘
  grafana:
    image: grafana/grafana:latest
    container_name: monitoring-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin # 初始密码设为 admin
    depends_on:
      - prometheus

# 可视化监测面板 end

volumes:
  kafka_data:
  mysql_data:
```

> **特别提示**：对于 M 系列芯片用户，MySQL 镜像建议指定 `platform: linux/amd64`，虽然会有性能损耗，但能避免 ARM 架构下的兼容性玄学问题。

---

## 开发工作流演示

拥有这套环境后，您的日常开发流将变为：

1. **一键启动**：

   Bash

   ```
   docker-compose up -d
   ```

2. **代码开发**：在 IDEA 中编写 Flink SQL 或 DataStream 代码。
3. **依赖注入**：将打好的 Jar 包丢入 `./flink-data/usrlib`，Docker 自动同步。
4. **任务发布**：打开 `http://localhost:10000` (StreamPark)，选择 Remote 模式，指向 `flink-jobmanager:8081`。
5. **问题排查**：
   - 看日志：`docker logs -f flink-taskmanager` (Warp 终端配合更佳)。
   - 看监控：`http://localhost:3000` (Grafana)。

## 总结

这套方案不是简单的堆砌镜像，而是经过了**网络互通**（Kafka Advertised Listeners）、**存储挂载**（Maven/Checkpoint持久化）和**资源配额**三大维度的优化。

它将原本需要一天搭建的开发环境，压缩到了一个 `docker-compose up -d` 命令中。
