# Article Outline

> **状态：已否决的第一版大纲。** 新范围为 TencentDB Agent Memory / Mem0 / Graphiti / Letta，见 [HANDOFF.md](./HANDOFF.md)。

建议首篇标题：

> 《Agent Memory 不是向量数据库：拆解 Claude Code、Codex、Gemini CLI、OpenCode 与 DSH 的四层记忆系统》

备选标题：

- 《为什么最火的 Coding Agent 都先用 Markdown 和事件日志，而不是向量数据库？》
- 《从 MEMORY.md 到 Event Sourcing：2026 Agent 记忆系统的真实架构》

## 结构

1. 反常识开场：同一句“Agent 记得我”，至少指四件不同的事。
2. 四层模型：规则、工作上下文、会话证据、长期知识。
3. Claude/Codex/Gemini：谁可以把一次经历提升为长期记忆？
4. DSH/OpenCode：为什么 session replay 和 compaction 比 vector search 更接近 OS 底座？
5. OpenClaw/Hermes：文件记忆的两种极端——分层冷热与硬预算。
6. 文件方案为什么有效，又在哪些场景崩溃。
7. TencentDB/Mem0/Graphiti/Letta 应该接在哪里。
8. 一套可复现实验：准确率、污染率、冲突、遗忘、成本、恢复。
9. 结论：下一代 memory 的竞争是生命周期治理，不是存储介质。

## 后续可拆分系列

1. DSH 专篇：`Session = append-only event log`，讲 Agent OS 如何做 replay、compaction 与 crash recovery。
2. 自动记忆专篇：Gemini CLI、Codex、Claude Code 的抽取时机、审批与 consolidation。
3. 工程实验：给七个 Agent 喂同一套 30 天项目演进，测试错误固化和遗忘。
4. 基础设施选型：什么时候 Markdown 够用，什么时候需要 TencentDB/Graphiti/Mem0/Letta。
