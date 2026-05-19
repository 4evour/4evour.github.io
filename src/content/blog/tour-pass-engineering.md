---
title: "Tour Pass 的工程化和面试演示链路"
description: "记录 Tour Pass 怎么从算法代码变成稳定演示项目：Makefile/CMake、服务运行时、数据质量门禁、CI、API 冒烟、Web 演示台、LLM 兜底和性能基准。"
pubDate: 2026-05-18
tags: ["C++", "工程化", "CI", "项目复盘"]
project: "Tour Pass"
featured: true
coverTone: "forest"
coverLabel: "Ops"
draft: false
---

Tour Pass 一开始像一个算法项目，但我不想让它停在“本地能跑一个规划函数”。

如果这个项目要放进简历和面试展示，它还需要几件事：能稳定构建，能自动测试，数据坏了能发现，API 能冒烟验证，页面能展示算法过程，服务端运行状态能被观察，远程 LLM 不可用时也能讲得下去。

所以这篇主要记录 Tour Pass 的工程化部分。

## 两套构建入口

项目保留了 Makefile 和 CMake。

Windows 本地最常用的是：

```powershell
mingw32-make build
mingw32-make test
mingw32-make run
mingw32-make clean
```

CMake 入口也已经配置好：

```powershell
cmake -S . -B build
cmake --build build
ctest --test-dir build
```

如果需要启用 GoogleTest，可以显式打开：

```powershell
cmake -S . -B build -DTOURPASS_USE_GTEST=ON
cmake --build build
ctest --test-dir build
```

我保留轻量 C++ 测试运行器，是因为作品项目经常要在不同机器上展示。不是每台机器都有完整测试依赖，轻量测试可以降低本地验证门槛；CMake + GoogleTest 则给后续扩展留空间。

## 服务运行时补上后端治理

Tour Pass 后来新增了 `service_runtime` 模块。它不改变行程规划算法本身，而是让 C++ HTTP 服务更像一个可解释的后端服务。

运行时配置来自环境变量：

- `TOURPASS_WORKERS`：HTTP worker 数。
- `TOURPASS_MAX_QUEUE`：请求队列上限。
- `TOURPASS_MAX_BODY_BYTES`：JSON 请求体大小限制。
- `TOURPASS_CACHE_ENTRIES`：进程内缓存容量。
- `TOURPASS_CACHE_TTL_SECONDS`：缓存 TTL。
- `TOURPASS_MAX_TRIP_JOBS`：异步任务保留数量。

我觉得这层很适合面试讲。因为它回答的是“算法服务真的被请求打进来以后，怎么治理”。

比如中间件会为每个响应写 `X-Request-Id` 和 `X-Response-Time-Ms`，缓存接口会写 `X-Cache: HIT/MISS`。异常会统一进入错误结构，请求体太大则返回 `PAYLOAD_TOO_LARGE`。这些东西不复杂，但它们能说明我没有只停留在“函数能跑”。

## 缓存、指标和异步任务

项目现在给 `/route/shortest`、`/poi/search` 和 `/trip/plan` 做了进程内 LRU + TTL 缓存。缓存数据保存在进程内，没有引入 Redis，这符合当前本地演示边界；如果以后产品化，这层可以替换成分布式缓存。

异步规划任务通过：

```text
POST /trip/jobs
GET /trip/jobs/{id}
DELETE /trip/jobs/{id}
```

提供。提交任务时返回 `job_id` 和状态查询地址，后台 worker 负责真正规划。状态包括 `QUEUED`、`RUNNING`、`SUCCEEDED`、`FAILED` 和 `CANCELLED`。

`GET /metrics` 会返回 JSON 指标快照，包括请求总数、进行中的请求、状态码、路由耗时、缓存命中率、任务状态、线程池配置和队列深度。它不是接 Prometheus 的完整监控，但足够支撑本地演示和性能报告。

## 数据质量是算法项目的地基

Tour Pass 的路线质量高度依赖 `data/pois.json` 和 `data/edges.json`。

如果 POI 时间格式错了、边引用了不存在的站点、图不连通，算法不一定会直接崩，但输出会变得很奇怪。这种问题靠人工看页面很难稳定发现。

所以项目里加了：

```powershell
mingw32-make validate-data
node scripts/validate_data.js
```

校验覆盖：

- JSON 顶层结构。
- POI 必填字段。
- 坐标、开放时间、热度和价格范围。
- POI id 是否重复。
- 标签是否为空或重复。
- 是否至少包含酒店、景点、餐厅和夜间活动。
- 边是否引用存在的 POI。
- 边距离和通勤耗时是否合法。
- 无向图是否连通。

这件事看起来不像算法本身，但它决定算法是否可信。很多规划系统的问题不是搜索写错了，而是输入数据悄悄坏了。

## API 冒烟测试让演示更稳

项目提供了 `scripts/api_smoke.ps1`，可以启动服务后检查核心 API。

本地也可以跑：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/api_smoke.ps1 -AppPath bin/tourpass.exe -Port 8091
```

它的意义不是替代完整测试，而是验证“这个可执行文件作为服务真的能完成主链路”。对 Tour Pass 来说，主链路包括健康检查、行程生成、路径查询、检索和解释兜底。

现在冒烟脚本也会覆盖请求头、缓存、异步任务和指标接口，避免运行时层只是“文档里说有”。

我还做了一键演示脚本：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/demo.ps1
```

脚本会构建服务、启动本地进程、检查 `/health`，并输出候选行程冒烟结果。这样面试前不用手动敲一串命令，也减少临场出错概率。

## CI 跑跨平台构建

GitHub Actions 工作流会在 Ubuntu 和 Windows 上运行：

- 数据验证。
- CMake 构建。
- CTest。
- Windows API 冒烟测试。

这对 C++ 项目尤其重要。很多代码在本机 MinGW 能过，换到 Linux 或另一个编译器就会暴露路径、链接、依赖和编码问题。

当前项目还处理了一个实际问题：Windows Makefile 构建在未启用 OpenSSL 时，可以通过系统 WinHTTP 兜底发起 HTTPS LLM 请求；CMake 检测到 OpenSSL 时，则使用 `cpp-httplib` 的 HTTPS 支持。

这让远程 LLM 能力不至于卡死在某一个本地依赖上。

## LLM 兜底是演示稳定性的关键

Tour Pass 支持 OpenAI 兼容接口，可以读取 `config/llm.local.json`，也能用环境变量配置：

```powershell
$env:OPENAI_API_KEY="sk-..."
$env:LLM_BASE_URL="https://api.openai.com/v1"
$env:LLM_MODEL="gpt-4o-mini"
```

DeepSeek 这类兼容接口也可以通过 `base_url` 和 `model` 切换。

但更关键的是，未配置密钥或远程调用失败时，`/itinerary/explain` 会自动使用本地中文模板。面试或离线演示时还可以强制关闭远程调用：

```powershell
$env:LLM_DISABLED="1"
mingw32-make run
```

我把 LLM 定位成解释层增强，而不是核心规划依赖。这样即使没有网络，路线、候选、检索、对比、时间窗和模板解释仍然完整可用。

这个边界让我很安心。AI 功能可以增加表达力，但不应该让整个项目的可运行性被一个外部 API 绑架。

## Web 演示台按面试路径组织

`web/` 是本地静态演示台，由 C++ 服务托管。

它现在的结构不是“一个页面塞满所有 JSON”，而是按演示阶段组织：

1. 规划概览。
2. 候选对比。
3. 路线明细。
4. 算法解释。
5. 路径、检索、替换和 LLM 工具。

页面会把结构化响应拆成更容易讲的模块：

- 候选方案卡片。
- 每日路线带。
- 时间轴。
- KPI 指标。
- 约束命中。
- 未安排原因。
- 站点评分拆解。
- Beam Search 保留状态。
- Pareto 分层依据。
- BM25 排序贡献。
- 服务端指标和缓存命中状态。

这部分其实非常影响项目观感。很多算法项目不是没有东西，而是展示时只给一大段 JSON，别人很难在几分钟内看懂你做了什么。

Tour Pass 的 Web 台就是为了解决这个问题：把“算法做出的决定”翻译成能被浏览器快速扫读的界面。

## 性能基准不是炫数字

项目里有 `scripts/benchmark.js`，可以生成性能报告：

```powershell
node scripts/benchmark.js --app bin/tourpass.exe --port 8092 --iterations 20 --warmup 3 --concurrency 8 --report docs/performance_report.md
```

报告会记录 `/health`、冷/热缓存路径查询、热缓存 POI 搜索、同步规划、并发规划和异步任务端到端耗时的 avg、p50、p95、min、max。

当前样例规模下，热缓存路径查询大约 0.6ms，热缓存 POI 搜索大约 0.8ms，同步规划大约 4ms；异步任务端到端因为包含后台执行和轮询，大约 450ms 量级。这个数字的意义不是“压测很厉害”，而是建立一个回归基线。

如果以后我改 Beam Search 参数、增加候选策略、扩大 POI 数据集、调整缓存或线程池，性能报告能告诉我：这次改动有没有把演示体验拖慢。

## 编码和命令细节也要处理

Windows PowerShell 直接内联中文 JSON 很容易出现编码问题。

所以文档里的 API 示例统一推荐：

```powershell
curl.exe -X POST http://127.0.0.1:8080/trip/plan `
  -H "Content-Type: application/json; charset=utf-8" `
  --data-binary "@docs/sample_trip_request.json"
```

也就是把中文请求体放在文件里，再通过 `--data-binary` 传给服务。这个细节很小，但它能避免很多“代码没错，终端把中文弄坏了”的假问题。

## 推荐的演示顺序

如果我要在面试里讲 Tour Pass，我会按这个顺序：

1. 先运行 `mingw32-make test`，证明核心行为测试可跑。
2. 运行 `scripts/demo.ps1`，启动服务和本地 Web 演示台。
3. 生成 5 个候选方案，讲策略差异和候选对比。
4. 打开路线明细，讲时间轴、时间窗复核和站点评分拆解。
5. 打开算法解释，讲 Beam Search 和 Pareto 非支配排序。
6. 查询 `hotel_wuyi -> yuelu_academy`，讲 Dijkstra/A*。
7. 搜索“室内 艺术”，讲 BM25 字段权重和排序贡献。
8. 切换 `LLM_DISABLED=1`，说明离线模板兜底。
9. 展示性能报告和 CI，说明这个项目不是临时拼出来的页面。
10. 打开 `/metrics`，讲线程池、缓存命中率、异步任务和接口耗时。

这个顺序的好处是，从“能跑”开始，再讲“为什么这么设计”，最后回到“怎么保证它稳定”。

## 我觉得这部分的价值

Tour Pass 的工程化没有追求特别复杂的基础设施。

它没有数据库，没有容器编排，也没有接真实地图服务。相反，它把精力放在这个阶段最重要的几件事上：本地稳定运行、数据质量、API 可验证、请求可追踪、热点可缓存、任务可异步、演示可视化、远程依赖可降级、性能有基线。

这让它更像一个适合展示的算法工程项目。

算法本身是核心，但让别人相信这个算法服务可靠，靠的是这些看起来不那么耀眼的工程细节。
