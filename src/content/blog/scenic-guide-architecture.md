---
title: "我做了一个景区智能导览系统"
description: "记录灵山胜境智能导览系统的整体搭建过程：Go/Gin、GORM/SQLite、Vue、RAG、鉴权、安全边界和数字人入口。"
pubDate: 2026-05-16
tags: ["Go", "Vue", "项目复盘", "智能导览"]
project: "灵山胜境智能导览系统"
draft: false
---

这篇想记录一下我做的“灵山胜境景区智能导览系统”。

它不是一个单纯的后台管理项目，也不是只接一个大模型聊天接口。这个项目里同时有景点和路线管理、游客问答、RAG 知识库、管理后台、运营数据看板、OpenAI 兼容代理和 Live2D 数字人入口。对我来说，它更像一次把 Go 后端、Vue 前端和 AI 应用工程化揉在一起的练习。

我希望它看起来不是“能跑的 demo”，而是一个有边界、有兜底、有维护入口的小系统。

## 主服务用 Go 扛住所有入口

后端主服务用了 Go + Gin。数据层是 SQLite + GORM，配置用 Viper，鉴权用 JWT。

`main.go` 里我没有把启动流程写得很随意，而是按依赖顺序一步步来：

1. 读取 `configs/` 下的配置。
2. 初始化 `slog` 日志。
3. 初始化 JWT。
4. 连接 SQLite。
5. 执行 GORM AutoMigrate。
6. 初始化 RAG 服务。
7. 组装 repository、service、handler。
8. 注册 API、静态资源、Vue SPA、WebSocket 代理。
9. 用 `http.Server` 启动，并支持 SIGINT/SIGTERM 优雅关闭。

这里有几个我比较在意的小点。

第一，JWT 初始化会拒绝空密钥、常见默认密钥，以及短于 32 字符的密钥。因为这类项目很容易为了本地调试写一个 `your-secret-key`，然后不小心带到公开环境。与其在文档里提醒，不如在启动时直接失败。

第二，HTTP 服务不是直接 `r.Run()`。我改成了 `http.Server`，设置了 `ReadHeaderTimeout`、`ReadTimeout`、`WriteTimeout`、`IdleTimeout` 和 `MaxHeaderBytes`。这些不是为了炫配置，而是为了让服务在面对慢请求、异常连接时不至于太裸奔。

第三，关闭服务时用了 10 秒超时的 graceful shutdown。对一个小项目来说这可能有点认真，但我觉得这是写 Web 服务时应该养成的习惯。

## 分层不是为了好看

后端分成了 handler、service、repository、model 和 pkg。

这个分层不是为了显得“架构很企业级”。主要是因为项目功能确实多：用户、景点、路线、知识库、AI、数字人、后台统计，每一块都往 handler 里塞会很快失控。

现在大致是：

- handler 处理 HTTP 请求、参数校验和响应。
- service 写业务逻辑，比如 RAG、统计、路线匹配。
- repository 负责数据库访问。
- model 定义 GORM 模型。
- pkg 放 JWT、中间件、统一响应、日志、统计服务引用。

比如数字人聊天接口里，handler 不直接查数据库，也不直接拼 SQL，而是调用 RAGService 和 RouteService。这样我改知识库逻辑时，不需要同时改一堆 HTTP 层代码。

## 静态资源和 Vue SPA 的取舍

前端用了 Vue 3 + Vite + TypeScript。管理后台、地图页、数据看板和数字人备用视图都在 `web-vue/` 里。

构建产物输出到 `static/vue-app/`，由 Go 服务托管。后端把 `/app`、`/admin`、`/dashboard`、`/digital-human` 都指到同一个 Vue SPA 入口。

这不是最“云原生”的部署方式，但对这个项目很合适。它减少了演示时的服务数量，也让整个系统可以用一个 Go 进程托住 API 和页面。后面如果真要部署到更正式的环境，再拆前后端也不迟。

前端视觉上我做了一套 `--sg-*` 设计 token，想让它更像“文旅国风科技”，而不是默认后台模板。比如数据看板是深色底，青色科技线和金色文化强调一起用；管理页和地图页也尽量复用同一套变量。

## API 和权限边界

后端 API 统一挂在 `/api/v1` 下，响应格式统一成：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

权限上，我没有简单地把所有接口都公开。景点、路线、导览内容的 GET 可以公开查，写操作必须管理员鉴权。知识库上传、删除、清空和后台统计也都需要管理员权限。

注册接口做了按 IP 的轻量限流，默认每分钟 5 次。它不是什么复杂风控，但至少避免公开注册接口完全裸露。删除全部知识库的接口也要求显式带 `confirm=DELETE_ALL_KNOWLEDGE`，防止误触发。

为了本地演示，我还加过一个 `SCENIC_GUIDE_DEV_ADMIN_BYPASS=true`。但它只对回环地址生效，而且默认关闭。这个设计主要是平衡开发便利和安全边界：本地录屏时不用一直登录，但不能把这个口子带到生产环境。

## AI 能力不是只有一个接口

这个系统里有两条 AI 入口。

第一条是普通的 `/api/v1/ai/chat`，给站内问答用。

第二条是 `/v1/chat/completions`，它做成了 OpenAI-compatible 的格式，主要是给 Open-LLM-VTuber 调用。这个接口还兼容了两种 content 形式：普通字符串，以及类似多模态数组的结构。真正取问题时，会从 messages 里倒序找最后一条 user 消息。

我还实现了非流式和 SSE 流式响应。流式响应会按几个字符一批输出 `chat.completion.chunk`，最后发 `[DONE]`。这块不是为了“模拟得很完美”，而是因为数字人端更习惯接 OpenAI 风格接口，如果后端能兼容，就能少改上游项目。

日志上也做了取舍：我不会把完整问题、完整回答、请求体和响应体都打出来，只记录长度、耗时、状态、trace_id 这类信息。AI 项目很容易在日志里泄露用户输入，尤其是问答系统，最好一开始就克制一点。

## CI 里放了几道基本闸

项目的 CI 分了后端和前端。

后端跑：

```powershell
go test ./...
go vet ./...
```

前端跑：

```powershell
npm run check:encoding
npm run check
npm run build
```

另外还有 `scripts/check-secrets.mjs` 做密钥扫描。因为这个项目涉及 AI API Key、Embedding Key、JWT Secret，配置泄露风险比普通前端项目更高。

中文项目还有一个很烦的问题：Windows PowerShell 输出有时会把 UTF-8 中文显示成乱码。我没有把它当成玄学处理，而是加了 `.editorconfig` 和编码检查脚本，尽量把“文件坏了”和“终端显示坏了”分开。

## 这个项目真正难的地方

最难的其实不是某个技术点，而是把这些技术点放到一个系统里以后，边界怎么划。

RAG 要能用外部 Embedding，也要能在没有 key 时降级。数字人要能接语音和表情，但不能让 Go 后端背上音频处理的复杂度。管理后台要方便演示，但权限不能随便开。日志要能排障，但不能泄露完整用户内容。

这些问题都不华丽，但它们决定了项目看起来是“拼出来的 demo”，还是“认真做过取舍的系统”。

现在这版当然还可以继续变强，比如数据库换成 PostgreSQL、引入 Redis、补更多端到端测试、把部署做成容器化流水线。但作为一个阶段性作品，它已经能比较完整地展示我对全栈系统、AI 接入和工程边界的理解。
