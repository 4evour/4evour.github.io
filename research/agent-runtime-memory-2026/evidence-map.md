# Evidence Map

研究日期：2026-08-17。结论只覆盖公开文档与公开仓库；闭源服务端行为不作推断。

## 研究问题

1. 热门 Agent 如何把当前上下文、会话状态、跨会话长期记忆和团队知识拆开？
2. 谁负责写入，何时写入，是否需要审批，怎样检索、合并、遗忘与恢复？
3. 为什么成熟 Agent 往往先做 Markdown、事件日志、checkpoint 与 compaction，而不是直接内置一个向量数据库？
4. TencentDB Agent Memory、Mem0、Graphiti、Letta 这类基础设施在哪一层才真正必要？

## 样本与证据

| 系统 | 主要证据 | 关键结论 | 证据强度 |
|---|---|---|---|
| Claude Code | [官方 memory 文档](https://code.claude.com/docs/en/memory) | 人写 `CLAUDE.md` 与 Agent 写 Auto Memory 分离；前者是规则上下文，后者是每仓库的机器本地学习；`MEMORY.md` 只自动装载前 200 行或 25KB，详细主题按需读取 | A：官方文档 |
| Codex | [官方 memories 文档](https://learn.chatgpt.com/docs/customization/memories)、[AGENTS.md 文档](https://learn.chatgpt.com/docs/agent-configuration/agents-md) | 必须遵守的团队规则放 `AGENTS.md`；长期记忆是独立的本地 recall layer。后台从合格旧会话提取并全局 consolidation，可因外部上下文、配额或会话状态跳过 | A：官方文档 |
| Gemini CLI | [Auto Memory](https://geminicli.com/docs/cli/auto-memory/)、[memory management](https://geminicli.com/docs/cli/tutorials/memory-management/)、[checkpointing](https://geminicli.com/docs/cli/checkpointing/) | 旧 transcript 在空闲后异步挖掘，生成可审阅 `.patch` 和 `SKILL.md`；审批后才进入长期记忆。checkpoint 单独负责文件与会话回滚 | A：官方文档 |
| OpenCode V2 | [Compaction](https://opencode.ai/v2/docs/compaction)、[Snapshots](https://opencode.ai/v2/docs/snapshots) | compaction 是有损的活动上下文投影，不删除旧 durable messages；checkpoint 保存结构化摘要与最近 tail。文件回滚由独立 Git object DB snapshot 完成 | A：官方文档 |
| DSH | [事件溯源决策](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/.agents/notes/implemented/architecture/2026-06-11-event-sourced-sessions.md)、[压缩子系统](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/docs/subsystems/compaction.md)、[Zstd JSONL](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/.agents/notes/implemented/architecture/2026-07-19-zstandard-jsonl-session-logs.md)、[第三方 memory MCP](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/99f6f02fecdb7dff40c3fbc9470f5907c29f74ca/.agents/notes/implemented/feature/2026-07-31-third-party-memory-mcp-examples.md) | append-only event log 是 session 唯一真相；消息是派生投影；compaction 以日志事务记录且保留被遮蔽事件；跨会话语义记忆刻意留给通用 MCP | A：代码仓库设计文档 |
| OpenClaw | [Memory](https://docs.openclaw.ai/concepts/memory)、[Main session](https://docs.openclaw.ai/concepts/main-session)、[FAQ](https://docs.openclaw.ai/help/faq) | `MEMORY.md` 保存精选长期事实，daily notes 保存近期工作记忆；压缩前静默 flush，先把值得长期保留的内容落盘，再压缩活跃上下文 | A：官方文档 |
| Hermes Agent | [Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory/) | `MEMORY.md` 与 `USER.md` 有硬字符预算，启动时作为冻结快照注入；写满后必须主动合并或删除，强调有界核心记忆 | A：官方文档 |
| LangGraph | [Memory](https://docs.langchain.com/oss/python/concepts/memory)、[Persistence](https://docs.langchain.com/oss/python/langgraph/persistence) | thread checkpoint 与跨 thread store 是不同问题；长期记忆可在 hot path 或后台写入 | A：官方文档，作为概念坐标 |
| Letta | [Memory blocks](https://docs.letta.com/v1-sdk/memory/memory-blocks) | 总在上下文中的结构化 block，可由 Agent 自己编辑，也可共享或只读；适合“可见核心记忆”，不等同于历史检索 | A：官方文档，作为基础设施坐标 |
| Graphiti/Zep | [Temporal KG](https://help.getzep.com/graph-overview) | 以时间图谱保存事实变化，旧事实失效但历史不丢；解决文件式记忆缺少时间与关系的问题 | A：官方文档，作为基础设施坐标 |
| Mem0 | [Add](https://docs.mem0.ai/core-concepts/memory-operations/add)、[Search](https://docs.mem0.ai/core-concepts/memory-operations/search) | 自动抽取、过滤检索、过期等是外部长期记忆服务的典型能力 | A：官方文档，作为基础设施坐标 |

## 核心源码观察

### DSH

- `Session` 是 typed `SessionEvent` 的 append-only log，`deriveMessages()` 从日志生成模型消息；这让 replay、fork、trace 共享同一个真相源。
- 每个 turn 结束触发可等待的 flush，持久化插件 write-behind；正常热路径不因 I/O 阻塞。
- compaction 以 `compaction/start`、`compaction/summary`、替换投影的 `user/message`、`compaction/end` 组成。start 无 end 能暴露崩溃中的孤儿锁。
- `.jsonl.zstd` 使用“header 一帧 + 每个 durable append batch 一帧”；frame 边界同时是 fsync、校验和与崩溃修复边界。
- 第三方记忆只提供默认关闭的 MCP overlay 示例；账号、嵌入、存储、迁移、重试和故障恢复均归 provider 或用户。

### OpenCode V2

- compaction checkpoint = 结构化 summary + 序列化 recent tail；后续请求从最新完成 checkpoint 与其后消息组装。
- compact 是有损投影，早期 durable messages 不删除。
- 运行或失败的 compaction 不进入模型上下文，完成的 checkpoint 被明确标记为历史上下文，不是新指令。
- snapshot 使用独立 Git object database，覆盖对话回滚与部分工作树恢复；它不等价于 Git commit，也无法撤销数据库、服务与网络副作用。

## 事实、推断与待验证

| 类型 | 内容 |
|---|---|
| 事实 | Claude、Codex、Gemini 都已公开区分人写规则与机器生成记忆；Gemini 和 Codex 都把抽取放到后台，并设置会话资格与成本/安全门槛 |
| 事实 | DSH 与 OpenCode 都保留 durable session history，同时把活动上下文变成可重建的摘要投影 |
| 推断 | 2026 年 Agent memory 的主战场正在从“接哪个向量库”转向“哪些经历有资格被提升为长期记忆，以及如何审计、回滚、遗忘和控制成本” |
| 推断 | 对 coding agent，事件日志与 checkpoint 比语义检索更靠近系统正确性；向量/图谱记忆属于其上的能力层 |
| 待验证 | 各系统在长周期真实项目中的记忆准确率、错误固化率、冲突率与维护成本；公开文档不能回答，需要统一实验 |
