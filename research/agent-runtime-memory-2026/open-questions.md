# Open Questions

| ID | Question | Why It Matters | Missing Evidence | Next Check |
|---|---|---|---|---|
| OQ-001 | Mem0 ADD-only 长期运行后，重复、矛盾与过时事实的增长率是多少？ | 决定保守写入是否只是把成本推迟 | 长期真实数据与清理日志 | 构造偏好反转和事实演化数据集 |
| OQ-002 | Graphiti 的 LLM 冲突候选漏召回时，错误事实如何被发现和修复？ | 时间字段正确不等于事实解析正确 | failure benchmark、修复 API 使用数据 | 运行冲突召回与回溯实验 |
| OQ-003 | Letta Agent 自主管理 MemFS 的事实准确率、漂移和 Git 冲突率如何？ | 决定自治维护能否替代集中抽取 | 长期 agent trajectory、diff 与人工审查数据 | 记录 30 天多会话 Agent 的 memory commits |
| OQ-004 | TencentDB 四类资产之间发生语义冲突时谁是权威？ | 控制面统一后仍需跨资产一致性 | 跨资产冲突规则与测试 | 跟踪 Chat Memory、Skill、Wiki 同一事实更新 |
| OQ-005 | 四套系统在同一任务的 token、LLM 调用、写放大、存储和 P95 是多少？ | 选型不能只看抽象优雅 | 独立端到端基准 | 设计统一 ingest/search/update workload |
| OQ-006 | 组合系统时，怎样避免 Mem0/Graphiti/Letta/TencentDB 形成多个真相源？ | 组合能力会放大冲突与同步故障 | 明确 source-of-truth 协议和失败演练 | 先定义按记忆类型划分的 ownership matrix |
