---
title: 'When Your Mac Is Also Your LLM Server'
date: '2026-07-07'
tags: ['ollama', 'litellm', 'llm-gateway', 'local-inference', 'prometheus']
draft: false
summary: 'How one M4 Pro Mac became an LLM proxy, and the YAML file that holds it all together'
images: ['static/images/avatar_bak.png']
---

One laptop. Two models. One YAML file. No Kubernetes required — unless you count nohup as "infrastructure-as-code."

The Premise (Or, How I Learned to Stop Worrying and Love the Proxy)

Meet the AI Gateway. It lives at ai-gateway, occupies four files total, and somehow carries more architectural ambition than most microservice stacks you'll encounter at a conference.

There is no README.md. There is no Dockerfile. There are no tests (your tests are "did curl return 200?"). And that is the beautiful thing about this project: it is a personal local LLM gateway — a single developer, an M4 Pro Mac, and a YAML configuration file that quietly does the job of ten engineers' architecture review sessions.

The Stack (In Order of Increasing Complexity)

1. LiteLLM (litellm): An open-source Python library that provides a unified OpenAI-compatible API proxy. Think of it as a BART loader for LLM requests — every model plugs into the same track, and LiteLLM figures out which platform car to dispatch.
2. Ollama (http://localhost:11434): The actual inference engine running locally. Models include qwen3.6:35b-mlx, deepseek-r1:32b, deepseek-r1:8b, and nomic-embed-text:latest.
3. Uvicorn: The ASGI server that binds everything to http://127.0.0.1:4000. It's the unglamorous hero at the center of this story, printing an ASCII art banner like a CLI drug lord (the good kind).
4. Prometheus callbacks: Because even your local gateway needs metrics. The success_callback and failure_callback hooks to "prometheus" mean that someone, somewhere, is scraping litellm_completions_success_total and pretending it's production-grade observability.

Architecture: Four Models, Zero Compromise

The entire project is defined in a single YAML file: litellm_config.yaml (/app/ai-gateway/litellm_config.yaml). Four model definitions, one settings block, two general_settings blocks (a duplicate-key quirk worth noting — more on that later).

Route 1: coder — The Universal Programming Model

model_name: coder
litellm_params:
model: ollama/qwen3.6:35b-mlx
api_base: http://localhost:11434
temperature: 0.5
top_p: 0.9

This is the model exposed to Warp or Continue — IDE plugins that want code completions, chat responses, and the occasional "can you explain what this function does" without leaving the editor. Temperature of 0.5 means it's creative but not wild. Top-p of 0.9 means "pick from the top 90% of tokens" which in practice means "be smart but don't hallucinate a JSON parser from scratch."

The model choice is interesting: qwen3.6:35b-mlx. The -mlx suffix indicates this is an MLX-optimized quantized variant, Apple's native framework for running LLMs on Silicon. It runs on the M4 Pro's unified memory architecture, where RAM and GPU share the same pool — a feature that makes "my model was evicted" both possible and tragically common.

Route 2: reasoner — For When You Need to Think Before You Answer

model_name: reasoner
litellm_params:
model: ollama/deepseek-r1:32b
api_base: http://localhost:11434
temperature: 0.7
presence_penalty: 1.1
fallbacks: ["deepseek-r1-fallback"]

Here we have deepseek-r1:32b — a reasoning-focused model with a higher temperature (0.7, slightly more creative) and a presence_penalty of 1.1 (encouraging the model to vary its language rather than repeating itself in circles).

The fallback is where the story gets real. Line 17's Chinese comment translates to: "If the 32B model fails because the M4 Pro's VRAM got squeezed by other tasks, automatically downgrade to the 8B variant."

Let that sink in. This project has a hardware-aware fallback chain written into its config file. That is, effectively, what production distributed systems are — a graceful degradation path when things go wrong. The difference is most production teams write a postmortem; this developer writes a YAML key.

Route 3: deepseek-r1-fallback — The Safety Net

model_name: deepseek-r1-fallback
litellm_params:
model: ollama/deepseek-r1:8b
api_base: http://localhost:11434

Smaller, lighter, less likely to get evicted when Zoom opens and grabs VRAM. It exists solely so the reasoner route doesn't return a 500 error at inopportune moments. There is no elegance here. Just a smaller model waiting in the wings like a understudy who hopes they never get called but knows exactly their lines.

Route 4: embeder — Reserved for a Future That May Never Come

model_name: embeder
litellm_params:
model: ollama/nomic-embed-text:latest
api_base: http://localhost:11434

The comment says "reserved for RAG or Milvus vectorization." It is the project's equivalent of a "TBD" sticky note on a whiteboard that has been there since March. The embedding model sits idle, ready to turn text into vectors when — and if — the RAG pipeline materializes. It is the most honest line in any codebase: "we will use this later."

Configuration Details (The Bits That Matter)

Prometheus Metrics

litellm_settings:
success_callback: ["prometheus"]
failure_callback: ["prometheus"]

Both success and failure routes emit to Prometheus. This means your local gateway tracks every completed completion and every dropped request. If you have a Grafana dashboard, it's probably just one panel that says "things worked" and another that says "things broke," separated by a thin blue line of optimism.

Retries and Timeouts

general_settings:
num_retries: 2
request_timeout: 120

Two retries, two minutes max per request. The retry budget is modest but sufficient for the kind of latency where "the model is thinking" translates to "Ollama hasn't loaded the weights yet." A 120-second timeout means the system is willing to wait patiently — or until your coffee goes cold.

The Master Key

general_settings:
master_key: sk-local

A single API key for all local requests. It's called sk-local and it serves as "set the universal authentication key" in Chinese-comment parlance. There are no per-user tokens, no rate limiting, no scopes. This is a localhost-only gateway bound to 127.0.0.1 — the security commentary literally says "absolutely do not use 0.0.0.0."

Which is fair. If someone can reach your LLM proxy from outside your machine, you have bigger problems than an exposed API key.

A Note on YAML Structure

The config file has two general_settings blocks. The first sets num_retries: 2 and request_timeout: 120. The second sets master_key: sk-local. In standard YAML parsers, duplicate keys cause the second value to overwrite the first — but LiteLLM handles this gracefully by merging them. Still, it's a structural quirk that would make a code reviewer reach for their anti-anxiety medication.

The Runtime Story (What Happens When You Hit Enter)

The startup flow in start.sh is a masterclass in operational minimalism:

1. Check if already running: pgrep -f "litellm --config" prevents duplicate instances. If one exists, the script prints a cheerful "LiteLLM gateway is already running..." and exits.
2. Launch with nohup: The LiteLLM binary from ~/myenv3.13/bin/litellm starts in the background, bound to 127.0.0.1:4000, with logs redirected to logs/gateway.log.
3. Print directions: A friendly message tells you where the API lives, what key to use, and which model name to pick.

The stop.sh script is equally elegant — one line: pkill -f "litellm --config". No graceful shutdown signal, no drain period, just a kill switch wrapped in an emoji. 🛑

The gateway log at logs/gateway.log shows the full Uvicorn startup with a delightfully dramatic ASCII art banner — LiteLLM introducing itself like a CLI protagonist announcing their arrival.

INFO: Started server process [66060]
INFO: Uvicorn running on http://127.0.0.1:4000 (Press CTRL+C to quit)

And that's it. A process ID, a port number, and the quiet promise of chat.completions await.

What This Project Is (and Isn't)

What it is: A personal dev setup. A single developer's M4 Pro Mac serving as an LLM proxy for IDE tools like Warp and Continue. Four model routes, one YAML file, zero Docker containers.

What it isn't: A production service. No CI/CD pipeline. No tests. No rate limiting beyond a single shared key. No authentication layer beyond "localhost is trust." No load balancer. No monitoring dashboard (though Prometheus callbacks are there, waiting for someone to build one).

And that is precisely why I find it charming. In a world where LLM infra is drowning in Helm charts and service meshes, this project says: "You know what? It's just a proxy. curl localhost:4000/v1 and move on with your day."

Key Takeaways for the Rest of Us

1. Fallback chains are free architecture. You don't need a circuit breaker library to implement graceful degradation — just a YAML key and some humility about your hardware's limits.
2. Local-first is not "not production". Running LLMs on a laptop via Ollama is a legitimate inference strategy for development, prototyping, and even light usage. The M4 Pro's unified memory architecture is genuinely capable of serving 35B models at usable speeds.
3. Prometheus callbacks make everything "observability-grade." Adding success_callback: ["prometheus"] to your config gives you the same metrics infrastructure as a production cluster, assuming you have a Grafana panel waiting to be built. The bar is low, but the step forward is real.
4. The best gateway is the one you actually use. This project's purpose is clear: route local LLM requests through a unified OpenAI-compatible interface so that IDE plugins don't need to know which model they're talking to. Done in four lines of YAML and two shell scripts. No README required.
