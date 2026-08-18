# Visual Plan

1. 主图：四层 Agent Memory Stack。
   - 规则/身份：CLAUDE.md、AGENTS.md、GEMINI.md
   - 工作上下文：当前 messages、tools、recent tail
   - 会话证据：event log、transcript、checkpoint、snapshot
   - 长期知识：MEMORY.md、skills、vector/graph/control plane
2. 生命周期图：experience → durable evidence → extraction candidate → review/gate → consolidation → retrieval/injection → correction/forgetting。
3. 对比表：七个热门 Agent 的写入者、触发、审批、预算、恢复、外部层。
4. DSH 事务图：event append → write-behind → turn flush → Zstd frame；compaction start → summary → surface replace → end。

图必须表达机制，不画无信息量的“大脑 + 数据库”装饰图。
