# Claim Ledger

| ID | 文章主张 | 类型 | 主要支撑 | 反例或边界 |
|---|---|---|---|---|
| C1 | Agent memory 不是一个组件，而是四个相互独立的平面 | 综合判断 | Claude/Codex/Gemini 的规则与自动记忆分离；DSH/OpenCode 的 session/compaction；Mem0/Graphiti/Letta 的外部长期层 | 产品可能将多层封装成一个 UI，但内部责任仍不同 |
| C2 | session persistence 不等于 long-term memory | 事实+解释 | DSH append-only log、OpenCode durable messages、LangGraph checkpoint/store 区分 | 用户体验上都表现为“记得过去”，容易混淆 |
| C3 | compaction 不是记忆写入，而是活动上下文的有损投影 | 事实+解释 | OpenCode checkpoint、DSH shadowed events、Claude `/compact` 后重新注入规则 | compaction 前 flush 可触发真正的长期记忆写入，如 OpenClaw |
| C4 | 必须遵守的规则不应只放自动记忆 | 事实+规范判断 | Claude 说明 memory 是 context 非 enforcement；Codex 明确要求团队规则放 AGENTS.md | 规则文件本身也只是 prompt，硬约束仍需 hook/sandbox/policy |
| C5 | 自动记忆正在采用异步、资格门槛、审批/控制与 consolidation | 趋势判断 | Gemini 3h/10 消息/lock/patch review；Codex idle/short-session/quota/external-context gates；Claude bounded index | Claude 的当前 Auto Memory 可在会话内直接写，不都要求审批 |
| C6 | DSH 的原生底座更像“可恢复过去”，而不是“自动学会用户” | 事实+解释 | 事件溯源、JSONL/Zstd、compaction transaction、third-party MCP boundary | 外部 MCP 可补足跨会话语义记忆，因此不是“不支持记忆” |
| C7 | 文件记忆适合个人与单机 Agent，组织级共享与时间治理需要更强基础设施 | 设计判断 | Claude machine-local；Hermes bounded files；Graphiti temporal KG；TencentDB 既有报告 | 小团队可能用 Git 管理 Markdown 达到足够效果 |
| C8 | 真正值得比较的是生命周期，不是“是否有向量数据库” | 方法论 | 写入者、触发、审查、作用域、检索、合并、遗忘、来源、回滚、成本十个维度 | 对纯 RAG 产品，检索质量仍是核心维度之一 |

## 不应写成事实的内容

- 不把 GitHub stars 当质量排名。
- 不声称闭源云端存在或不存在未公开记忆组件。
- 不把上下文窗口增大等同于解决长期记忆。
- 不把可恢复 transcript 等同于模型会主动回忆。
- 不把自动抽取的 summary 当作无损事实库。
