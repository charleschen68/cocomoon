---
title: '我用 Docker + AI 在 Mac 上造了一个“数字员工” Dofi'
date: '2026-03-02'
tags: ['dofi', 'ai', 'BigData']
draft: false
summary: '使用大模型 + 容器化agent打造安全可控的智能助手'
images: ['static/images/avatar_bak.png']
---

过去不靠人为就能操控电脑的软件我们叫病毒，今天我们来利用大模型的智能和执行之手agent来雇佣一个电子员工。

> **背景**：我经常带着轻便的设备（如手机/iPad）在外面。但我的核心生产力工具——那台电脑却必须留在家里跑重型服务。
>
> **痛点**：传统的向日葵/TeamViewer 远程桌面在弱网环境下卡顿严重，且无法在手机上通过自然语言高效操作。
>
> **解决方案**：利用 LLM 的代码生成能力，构建一个 **“Telegram -> Docker (AI大脑) -> Mac宿主机 (执行之手)”** 的 C/S 架构 Agent。
>
> 我给这个数字员工起名叫 **Dofi** (Docker + Flink + Intelligence)。

---

## 一、 为什么选择 Docker？架构优缺点分析

在动手之前，很多朋友可能会问：_“为什么不直接把 Bot 跑在本地？为什么要多此一举搞个容器？”_

作为一个有“环境洁癖”的大数据工程师，我是这样考量的：

### ✅ 优点（Why we do it）

1. **环境隔离（洁癖福音）**：
   - 我的 AI Agent 需要安装 `pyautogui`、`telegram-bot`、`openai` 等一堆依赖，甚至需要特定版本的 Python。
   - 我不希望这些杂乱的库污染我宿主机原本干净的系统 Python 环境（毕竟还要跑 Flink/Spark 任务）。Docker 用完即焚，干干净净。

2. **安全沙箱（Security）**：
   - **Dofi** 的大脑（LLM）会生成代码。如果直接在宿主机跑，AI 一旦抽风生成个 `rm -rf /`，风险极大。
   - 放在 Docker 里，默认它只能破坏容器内部。只有通过我显式定义的 HTTP 接口（`server.py`），它才能操作宿主机。这是一道天然防火墙。

3. **可迁移性**：
   - 如果哪天我想把这个 Brain 搬到云服务器上，直接把镜像推上去即可，配置都不用改。

### ❌ 缺点与挑战（The Cost）

1. **“次元壁”问题**：
   - Docker 容器天然看不到宿主机的屏幕，也无法控制鼠标。这导致我必须设计一个 **C/S 架构**（Client-Server）来穿透这层隔离。

2. **网络配置复杂度**：
   - 需要处理 `host.docker.internal` 网络通信，还要解决 Mac 端口被系统服务（如 AirPlay）占用的坑。

---

## 二、 架构设计：突破隔离

为了平衡隔离性与控制力，我设计了如下架构：

- **🧠 大脑 (Client - Dofi Bot)**：运行在 **Docker 容器**中。集成 Telegram Bot 和本地大模型 (Qwen/Ollama)。负责接收指令、生成 Python 操作代码。
- **✋ 手 (Server - Agent)**：运行在 **本地**。是一个轻量级 Python HTTP 服务。拥有“屏幕录制”和“辅助功能”权限，负责执行代码、截图。

## 三、 核心实现步骤

### 1. 基础设施：Orbstack + Docker Compose

由于我使用的是 Orbstack，它对 Network Host 模式支持极好。

```yml
services:
  dofi_brain:
    build: ./agent
    container_name: dofi
    image: dofi_image
    restart: always
    # 核心：Orbstack 环境下使用 host 模式
    # 这样 dofi 可以直接访问你本地上的 Flink(8081) 和 Ollama(11434)    network_mode: "host"
env_file:
      - .env  # 让 Docker 读取本地的 .env 文件
    environment:
      - TG_TOKEN=${TG_TOKEN}
      - ALLOWED_USER_ID=${ALLOWED_USER_ID}
      # --- 关键修改：适配你的 Qwen3-Coder ---      # 指向 Orbstack 宿主机上的 Ollama 端口
      - OPENAI_API_BASE=http://host.docker.internal:11434/v1
      - OPENAI_API_KEY=ollama  # Ollama 不校验 Key，随便填
      # 你的本地模型名称，必须和 ollama list 显示的一模一样
      - MODEL_NAME=qwen3-coder:30b

      # 其他配置
      - ENV_TYPE=production
      - FLINK_JM_URL=http://localhost:8081
      - KAFKA_BROKER=localhost:9092

    volumes:
      # 控制 Docker      - /var/run/docker.sock:/var/run/docker.sock
      # 挂载工作目录（生成的代码存在这里）
      - .:/app/workspace
```

### 2. 打造“手”：Mac 本地执行端

这是整个系统的执行核心。为了支持**中文输入**和**截图回传**，我使用了 `pyautogui` + `pyperclip` + `flask`。

**关键技术点**：

- **RCE (远程代码执行)**：开放一个 `/execute` 接口，接收 AI 生成的 Python 代码并 `exec()`。
- **中文输入 Hack**：`pyautogui` 不支持直接输入中文，必须用 `pyperclip.copy()` + `cmd+v` 粘贴的方式绕过。
- **截图格式坑**：Mac 截图默认是 RGBA，保存为 JPEG 会报错，必须转为 RGB。

# 定义允许 AI 使用的工具库

```python
app = Flask(__name__)
SAFE_GLOBALS = {
    "pyautogui": pyautogui,
    "time": time,
    "os": os,
    "subprocess": subprocess,
    "pyperclip": pyperclip,
    "keyring": keyring,
    "skills": skills,
    "search": skills.google_search,
    "search": skills.send_alert
}

@app.route('/execute', methods=['POST'])
def execute_code():
    try:
        code = request.json.get('code', '')
        print(f"⚡️ 执行代码:\n{code}")
        # 执行代码
        exec(code, SAFE_GLOBALS)
        return jsonify({"status": "success", "msg": "Executed"})
    except Exception as e:
        print(f"❌ 执行报错: {e}")
        return jsonify({"status": "error", "msg": str(e)}), 500

@app.route('/screenshot', methods=['GET'])
def get_screenshot():
    try:
        img = pyautogui.screenshot()
        # --- 核心修复：如果是 RGBA 格式，强制转为 RGB ---        if img.mode == 'RGBA':
            img = img.convert('RGB')

        img_io = BytesIO()
        img.save(img_io, 'JPEG', quality=70)
        img_io.seek(0)
        return send_file(img_io, mimetype='image/jpeg')
    except Exception as e:
        print(f"❌ 截图报错: {e}")
        return jsonify({"status": "error", "msg": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Mac Server running on port 5001...")
    app.run(host='0.0.0.0', port=5001)


@app.route('/')
def index():
    return
```

![与dofi bot 聊天记录](/static/images/blog/docker-ai-start-dofi/1.png)

````python
import os
import logging
import requests
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters
from openai import OpenAI

# 定义路径
PROMPT_DIR = "/app/workspace/agent/promats"
PRIVATE_PROMPT_PATH = os.path.join(PROMPT_DIR, "system_private.txt")
DEFAULT_PROMPT_PATH = os.path.join(PROMPT_DIR, "system.txt")

def load_system_prompt():
    prompt_content = "你是一个 Python 助手。" # 兜底默认值

    # 优先读私有
    if os.path.exists(PRIVATE_PROMPT_PATH):
        print(f"🔒 加载私有 Prompt: {PRIVATE_PROMPT_PATH}")
        with open(PRIVATE_PROMPT_PATH, "r", encoding="utf-8") as f:
            prompt_content = f.read()
    # 其次读默认
    elif os.path.exists(DEFAULT_PROMPT_PATH):
        print(f"🌐 加载默认 Prompt: {DEFAULT_PROMPT_PATH}")
        with open(DEFAULT_PROMPT_PATH, "r", encoding="utf-8") as f:
            prompt_content = f.read()
    else:
        print(f"⚠️ 警告: 找不到 Prompt 文件！路径: {PROMPT_DIR}")

    return prompt_content

# --- 初始化 ---SYSTEM_PROMPT = load_system_prompt()

# --- 配置区 ---TG_TOKEN = os.getenv("TG_TOKEN")
if not TG_TOKEN:
    # 如果没读到 Token，直接报错停止，防止瞎跑
    raise ValueError("❌ 致命错误: 环境变量 'TG_TOKEN' 未设置！请检查 .env 文件。")
    # ⚠️ 关键点：环境变量读出来是字符串，必须转成整数，否则 ID 永远对不上
try:
    ALLOWED_USER_ID = int(os.getenv("ALLOWED_USER_ID", "0"))
except ValueError:
    raise ValueError("❌ 配置错误: 'ALLOWED_USER_ID' 必须是纯数字！")

if ALLOWED_USER_ID == 0:
    print("⚠️ 警告: 未设置 ALLOWED_USER_ID，安全门禁已失效！")

    # 其他配置 (带默认值，防止 .env 漏写)
MAC_SERVER_URL = os.getenv("MAC_SERVER_URL", "http://host.docker.internal:5001")
OLLAMA_URL = os.getenv("OPENAI_API_BASE", "http://host.docker.internal:11434/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "qwen3-coder:30b")


# --- 内存暂存区 (用于存放待确认的代码) ---
# 格式: {user_id: "print('hello')"}
PENDING_CODE = {}

# LLM 客户端
client = OpenAI(base_url=OLLAMA_URL, api_key="ollama")

async def send_screenshot_result(bot, chat_id):
    await bot.send_message(chat_id=chat_id, text="📸 正在获取执行结果截图...")
    try:
        res = requests.get(f"{MAC_SERVER_URL}/screenshot", timeout=15)
        if res.status_code == 200 and len(res.content) > 0:
            await bot.send_photo(chat_id=chat_id, photo=res.content)
        else:
            err_msg = res.text[:200] if res.text else "空数据"
            await bot.send_message(chat_id=chat_id, text=f"⚠️ 截图失败: {err_msg}")
    except Exception as e:
        await bot.send_message(chat_id=chat_id, text=f"❌ 截图请求异常: {str(e)}")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_text = update.message.text.strip()
    chat_id = update.effective_chat.id
    user_id = update.effective_user.id

    # 1. 安全校验
    if user_id != ALLOWED_USER_ID:
        await context.bot.send_message(chat_id=chat_id, text="⛔️ 权限不足")
        return

    # 2. 检查是否有待确认的任务
    if user_id in PENDING_CODE:
        # 如果用户回复确认指令
        if user_text.lower() in ["ok", "确定", "yes", "执行", "go"]:
            code_to_run = PENDING_CODE.pop(user_id) # 取出并从暂存区删除
            await context.bot.send_message(chat_id=chat_id, text="🚀 收到确认，正在发送指令给 Mac...")
            try:
                res = requests.post(f"{MAC_SERVER_URL}/execute", json={"code": code_to_run}, timeout=30)
                if res.status_code == 200:
                    await context.bot.send_message(chat_id=chat_id, text="✅ 执行完毕")
                    await send_screenshot_result(context.bot, chat_id)
                else:
                    await context.bot.send_message(chat_id=chat_id, text=f"❌ Mac 端报错:\n{res.text}")
            except Exception as e:
                await context.bot.send_message(chat_id=chat_id, text=f"❌ 网络请求异常: {e}")
            return # 结束本次对话
            else:
            # 如果回复其他内容，视为取消或新指令（这里简化为取消）
            del PENDING_CODE[user_id]
            await context.bot.send_message(chat_id=chat_id, text="🚫 已取消上一次的执行任务。正在处理新需求...")
            # 此时继续往下走，把当前文本作为新需求处理

    # 3. 处理新需求 (生成代码)
    await context.bot.send_message(chat_id=chat_id, text="🤖 正在生成方案，请稍候...")

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"用户需求: {user_text}\n请生成Python代码。"}
            ]
        )
        ai_reply = completion.choices[0].message.content

        # 提取代码
        code = ""
        if "```python" in ai_reply:
            code = ai_reply.split("```python")[1].split("```")[0].strip()
        elif "```" in ai_reply:
             code = ai_reply.split("```")[1].split("```")[0].strip()

        if not code:
            await context.bot.send_message(chat_id=chat_id, text=f"⚠️ AI 未返回代码，回答如下:\n{ai_reply}")
            return

        # 4. 【关键修改】不直接执行，而是存起来并发给用户确认
        PENDING_CODE[user_id] = code # 存入暂存区
        confirm_msg = (
            f"⚡️ **代码已生成，请审核：**\n\n"
            f"```python\n{code}\n```\n\n"
            f"👉 回复 **ok** 或 **确定** 开始执行\n"
            f"👉 回复其他内容取消"
        )
        # MarkdownV2 格式需要转义，这里用简单的 Markdown 或纯文本即可
        await context.bot.send_message(chat_id=chat_id, text=confirm_msg, parse_mode="Markdown")

    except Exception as e:
        await context.bot.send_message(chat_id=chat_id, text=f"❌ 生成失败: {e}")

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    app = ApplicationBuilder().token(TG_TOKEN).build()
    app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message))
    print("Telegram Bot (Safe Mode) is running...")
    app.run_polling()


````

## 四、 封装与管理：你好，Dofi

为了让这个系统像一个真正的“数字员工”一样随叫随到，我写了一个管理脚本 `dofi`。

**功能**：

- `dofi start`：自动后台启动 Mac Server 和 Docker Container。
- `dofi stop`：一键清理所有进程，下班。
- `dofi status`：查看“手”和“脑”的存活状态。

```shell
#!/bin/bash

# --- 配置区 ---# --- 1. 加载配置文件 ---# --- 1. 智能定位 (解决找不到配置文件的关键) ---
# 获取脚本所在的真实目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONF_FILE="$SCRIPT_DIR/dofi.conf"

get_pid() {
    if [ -f "$PID_FILE" ]; then
        cat "$PID_FILE"
    fi
}

# --- 2. 加载配置 ---if [ -f "$CONF_FILE" ]; then
    # 进入项目目录运行，防止相对路径出错
    cd "$SCRIPT_DIR"
    source "$CONF_FILE"
else
    echo "❌ 错误: 找不到配置文件: $CONF_FILE"
    exit 1
fi
# --- 2. 检查必要变量是否加载 ---if [ -z "$WORKSPACE_DIR" ]; then
    echo "❌ 配置错误: WORKSPACE_DIR 未定义"
    exit 1
fi

# --- 颜色定义 ---GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function start_dofi() {
    echo -e "${YELLOW}🐶 dofi 正在打卡上班...${NC}"

    # 1. 启动 Mac 本地服务 (Backend)    if pgrep -f "$MAC_SERVER_SCRIPT" > /dev/null; then
        echo -e "   - 手 (Server) 已经在运行了。"
    else
        echo -e "   - 正在启动 手 (Server)..."        cd "$WORKSPACE_DIR"
        # 后台运行并将日志输出到文件
        nohup ~/myenv3.13/bin/python3.13 "$MAC_SERVER_SCRIPT" > "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
        sleep 2
    fi

    # 2. 启动 Docker 机器人 (Brain)    echo -e "   - 正在唤醒 脑 (Docker Bot)..."    # 确保容器是活着的
    docker start "$DOCKER_CONTAINER" > /dev/null 2>&1
    # 杀掉容器里可能残留的旧进程，防止重复回复
    docker exec "$DOCKER_CONTAINER" pkill -f tg_bot.py > /dev/null 2>&1
    # 后台启动新进程
    docker exec -d "$DOCKER_CONTAINER" python3 "$DOCKER_BOT_SCRIPT"
    echo -e "${GREEN}✅ dofi 已就位！随时待命。${NC}"
    echo -e "   (日志监控: tail -f $LOG_FILE)"
}

function stop_dofi() {
    echo -e "${YELLOW}💤 正在安排 dofi 下班...${NC}"

    # 1. 停止 Mac 服务
    if [ -f "$PID_FILE" ]; then
        kill $(cat "$PID_FILE") > /dev/null 2>&1
        rm "$PID_FILE"
        echo -e "   - 手 (Server) 已停止。"
    else
        # 双重保险：按文件名杀
        pkill -f "$MAC_SERVER_SCRIPT" > /dev/null 2>&1 && echo -e "   - 手 (Server) 已停止。"
    fi

    # 2. 停止 Docker 里的进程
    docker exec "$DOCKER_CONTAINER" pkill -f tg_bot.py > /dev/null 2>&1
    echo -e "   - 脑 (Docker Bot) 已休眠。"

    echo -e "${GREEN}👋 dofi 已退出。${NC}"
}

function status_dofi() {
             echo "🔍 检查 dofi 状态:"

             # --- 1. 检查手 (Server) ---             PID=$(get_pid)
             if [ -n "$PID" ] && ps -p "$PID" > /dev/null; then
                 echo -e "   - ✋ 手 (Server): ${GREEN}运行中 (PID $PID)${NC}"
             else
                 echo -e "   - ✋ 手 (Server): ${RED}未运行${NC}"
             fi

             # --- 2. 检查脑 (Docker Bot) ---             # 修复逻辑：使用 docker top 而不是 docker exec ps             # 只要容器里有 python 进程在跑 bot 脚本，就算运行中
             BOT_FILENAME=$(basename "$DOCKER_BOT_SCRIPT") # 获取文件名, 如 bot.py
             # 先看容器活着没
             if ! docker ps | grep -q "$DOCKER_CONTAINER"; then
                  echo -e "   - 🧠 脑 (Docker Bot): ${RED}容器未启动${NC}"
                  return
             fi

             # 再看进程 (docker top 不需要容器内安装 ps)             if docker top "$DOCKER_CONTAINER" | grep -q "$BOT_FILENAME"; then
                 echo -e "   - 🧠 脑 (Docker Bot): ${GREEN}运行中${NC}"
             else
                 echo -e "   - 🧠 脑 (Docker Bot): ${RED}未运行${NC} (容器活着，但 Python 脚本挂了)"
                 echo "     建议查看日志: dog log"
             fi
}

function show_log() {
    echo -e "${YELLOW}📄 正在查看 dofi 的工作日志 (按 Ctrl+C 退出)...${NC}"
    tail -f "$LOG_FILE"
}
```

# --- 命令行参数解析 ---case "$1" in

```shell
    start)
        start_dofi
        ;;
    stop)
        stop_dofi
        ;;
    restart)
        stop_dofi
        sleep 1
        start_dofi
        ;;
    status)
        status_dofi
        ;;
    log)
        show_log
        ;;
    *)
        echo "用法: dofi {start|stop|restart|status|log}"
        echo "示例: dofi start  (叫它上班)"
        echo "     dofi stop   (叫它下班)"
        exit 1
        ;;
```

注册别名后，我每天开机只需在终端输入：
![与dofi bot 聊天记录](/static/images/blog/docker-ai-start-dofi/2.png)

---

## 五、 总结

通过 Docker 隔离环境，配合本地的大模型能力，我实际上实现了一个**基于自然语言的操作系统接口**。

- **成本**：0 元（本地模型 + 现有硬件）。
- **能力**：只要 Python 能做的事，Dofi 都能做（爬虫、运维、文档处理、甚至写代码）。
- **安全**：通过 Docker 隔离风险，配合人工确认机制，安全可控。

---
