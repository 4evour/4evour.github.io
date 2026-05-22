---
title: "我把 Live2D 数字人接进了导览系统"
description: "记录灵山胜境智能导览系统里数字人部分的实现：Open-LLM-VTuber、OpenAI 兼容接口、SSE 流式响应、Live2D 表情和口型同步。"
pubDate: 2026-05-16
tags: ["数字人", "Live2D", "Go", "WebSocket"]
project: "灵山胜境智能导览系统"
featured: true
coverTone: "violet"
coverLabel: "Live2D"
draft: false
---

这个项目里最像“能被一眼看到”的部分，是数字人。

但我不想只是把一个 Live2D 模型摆在页面上。我的目标是让它真的接入导览系统：游客问问题，后端查知识库，生成回答，数字人播报，表情跟着变化，后台还能记录这次交互。

最后这条链路里用到了 Go/Gin、RAG、OpenAI-compatible API、SSE、WebSocket 代理、Open-LLM-VTuber、Vue、PixiJS 和 pixi-live2d-display。

这张图来自最新版本本地真实运行的数字人备用视图：页面里有 Live2D 舞台、打断和重连控制、交互记录，以及 Open-LLM-VTuber 未启动时的连接失败状态。它不是要替代 Open-LLM-VTuber 主服务，而是给主系统提供一个可演示、可观测的前端入口。

![灵山智能导览 Live2D 数字人备用视图](/images/blog/scenic-guide/digital-human.png)

## 为什么接 Open-LLM-VTuber

我没有从零写语音和数字人运行时，而是接了 Open-LLM-VTuber。

原因很简单：数字人这块涉及 ASR、TTS、WebSocket、Live2D 渲染、表情、口型，如果全部自己写，会把项目重心拖偏。我的主系统更应该负责景区业务、RAG 问答、路线推荐和数据记录。

所以最后分工是：

Open-LLM-VTuber 负责“怎么说、怎么动、怎么显示”。

Go 后端负责“答什么、从哪里查、怎么记录、有没有路线建议”。

我的定制层则负责景区品牌外壳、连接状态、麦克风权限提示、流式状态、打断/重试按钮和 trace_id 展示，让数字人入口更像主系统的一部分。

这个边界挺重要。否则数字人一接进来，后端很容易被音频流、模型状态、前端动画拖着走。

最新版本里我还单独写了 `docs/digital-human-production-check.md`，把联调检查项列清楚：品牌面板、WebSocket 状态、麦克风权限提示、SSE 流式状态、trace 展示、打断回答和重连会话。这个文档不是为了宣称“已经生产可用”，而是为了说明数字人这块到底验证了哪些协议和异常状态。

## 两套接口同时存在

我保留了两套数字人相关入口。

第一套是业务型接口，挂在 `/api/v1/dh/*`：

- `/dh/session/create`
- `/dh/chat/text`
- `/dh/chat/voice-transcript`
- `/dh/feedback`
- `/dh/health`

这些接口比较适合我自己的 Vue 页面调用。文本聊天和语音转写聊天都会进入同一套 RAG 逻辑，然后返回回答、情绪、trace_id 和可能的路线 payload。

第二套是 OpenAI 兼容接口：

```text
POST /v1/chat/completions
```

这套接口主要是为了让 Open-LLM-VTuber 能少改配置就调用我的 Go 后端。它支持非流式，也支持 `stream=true` 的 SSE 流式输出。

为了兼容不同请求格式，我让 message 的 `content` 用 `json.RawMessage` 接收。它既可以是普通字符串，也可以是类似 OpenAI 多模态接口那种数组。后端会从最后一条 user 消息里提取文本。

这块我觉得是数字人集成里很关键的一点：不是让外部项目适配我，而是我的后端尽量长得像它熟悉的接口。

## SSE 流式响应的处理

OpenAI 兼容接口里，如果请求带了 `stream=true`，我会返回 `text/event-stream`。

响应过程大概是：

1. 先发一个 role chunk。
2. 把回答按 rune 切成小块，每次发几个字符。
3. 最后一块带 `finish_reason=stop`。
4. 最后写入 `[DONE]`。

这不是真正边生成边输出，因为 RAG 当前还是先拿到完整回答，再模拟流式输出。但对数字人端来说，它能按照 OpenAI SSE 的格式消费内容，体验和兼容性都更好。

后面如果换成真正流式大模型，只需要把这里从“切完整回答”改成“转发模型 token 流”，接口形状不用大改。

## 情绪标签怎么驱动表情

后端在拿到 RAG 回答后，会做情绪检测。

它会根据回答内容判断 warm、happy、alert、apology 等状态，然后把情绪写进响应，也会拼到回答前面：

```text
[warm] 欢迎来到灵山胜境……
```

这个标签有两个作用。

一是数字人可以从文本里识别情绪，切换 Live2D 表情。

二是后台交互日志也能记录 emotion，用于后续看板展示。

现在的情绪检测还比较朴素，主要靠文本规则。但它把链路打通了：RAG 回答不再只是一段字符串，而是能带动前端表现状态。

## Live2D 不是只加载模型

Vue 里的 `Live2DStage.vue` 做了几件比较具体的事。

页面加载时会动态 import `pixi.js` 和 `pixi-live2d-display/cubism4`，然后加载 `mao_pro.model3.json`。模型加载成功后，Pixi ticker 会接管每一帧更新。

为了让模型适配舞台尺寸，我根据容器宽高和模型 bounds 计算缩放，把模型放在舞台中间偏下的位置。窗口 resize 时会重新同步布局。

表情不是随便切的。我维护了一个表达式映射：

```ts
neutral -> exp_02
happy -> exp_01
thinking -> exp_04
surprised -> exp_05
interrupted -> exp_07
```

为了避免异步表情切换乱序，还用了一个 `expressionSeq`。如果前一次 expression promise 晚回来，不会覆盖新状态。

口型同步也做了处理。模型更新前，通过 `beforeModelUpdate` 把当前音量写入 Live2D coreModel 的 `ParamA`。当状态是 speaking 时，`mouthOpen` 会映射到参数值；不说话时就归零。

这里我踩过一个点：Live2D 不是简单改 DOM 状态就会动，参数写入要卡在模型更新流程里，否则很容易出现口型不同步或者被下一帧覆盖。

## 备用动画也要有

Live2D SDK 或模型加载失败时，我没有让页面空着。

`Live2DStage.vue` 里有一个 canvas fallback，会画一个简化的数字人动画。它会根据当前状态和 `mouthOpen` 做一些基础动效，比如发光、眨眼、嘴部开合。

这不是为了替代 Live2D，而是为了让页面在依赖缺失时仍然有反馈。尤其是本地演示时，第三方依赖、路径和模型资源都可能出问题，有 fallback 会安心很多。

## WebSocket 统一入口

Open-LLM-VTuber 默认跑在 `127.0.0.1:12393`。

我在 Go 后端里加了：

```text
/vtuber-ws/*path
```

它会反向代理到 Open-LLM-VTuber。前端的 `VtuberSocketClient` 默认会拼：

```ts
ws(s)://当前域名/vtuber-ws/client-ws
```

这样前端不需要硬编码 `12393`，也不用关心当前页面是 http 还是 https。连接打开后，会自动发 `fetch-configs`、`fetch-history-list`、`create-new-history`，再发送用户文本或打断信号。

这个设计让数字人服务看起来像主系统的一部分，而不是旁边临时开的另一个页面。

## 交互日志和看板

每次数字人聊天成功后，如果统计服务可用，后端会记录：

- session_id
- query
- response
- emotion
- response_time_ms
- category
- source

source 会区分 `digital_human` 和 `voice`。后台看板可以基于这些数据展示热门问题、响应耗时、满意度趋势和最近交互。

这点我觉得很重要。数字人如果只是“会动”，其实很容易变成装饰。只有当它的交互进入数据层，它才真正成为系统的一部分。

## 这块的难点

数字人集成最麻烦的不是某一行代码，而是协议和状态很多。

HTTP 接口要给业务页面用，OpenAI 兼容接口要给 Open-LLM-VTuber 用，WebSocket 要代理实时连接，SSE 要像 OpenAI，Live2D 表情是异步的，口型参数要卡在模型更新前，语音入口又要复用文本 RAG。

如果这些东西各写各的，最后会变成一堆“能跑但很难改”的胶水代码。

我现在这版还可以继续优化，比如情绪检测更细、TTS 分段更自然、会话上下文更完整、路线推荐从关键词升级成意图识别。但第一版已经把最重要的链路接通了：

游客提问 -> RAG 回答 -> 情绪标签 -> 数字人播报与表情 -> 交互日志 -> 后台看板。

这也是我觉得这个模块最有价值的地方。它不是单独展示一个 Live2D，而是把数字人放进了一个真实业务流程里。
