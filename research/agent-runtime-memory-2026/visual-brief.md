# Visual Brief

## V-001
- reader_question: 四个项目究竟在同一个系统坐标的哪里？
- purpose: 用二维图展示“记忆对象复杂度”与“治理/Agent 自治程度”，标出四个系统，不做优劣排名。
- claim_ids: C-001, C-002, T-001, M-001, G-001, L-001
- source_or_path: `comparison-matrix.md`
- render_mode: deterministic-evidence
- exact_text: TencentDB / Mem0 / Graphiti / Letta；对象复杂度；治理与自治
- paired_with: 第 2 节

## V-002
- reader_question: 同一个“偏好反转”如何经过四套写入和冲突链路？
- purpose: 四行泳道图，展示 append、invalidate、commit、asset/version 的差异。
- claim_ids: M-001, M-002, G-002, G-003, L-004, T-004
- source_or_path: article section 7; claim-ledger.md
- render_mode: generated-relationship
- exact_text: 追加；显式更新；事实失效；Git commit；资产版本
- paired_with: 第 7 节

## V-003
- reader_question: 为什么 TencentDB 的“记忆”不是一个表？
- purpose: 确定性架构图，连接 Proxy、Core、Knowledge、Panel、四类资产和三种交付方式。
- claim_ids: T-001, T-002, T-003, T-005, T-006
- source_or_path: TencentDB `README_CN.md` and cited source paths
- render_mode: deterministic-evidence
- exact_text: Chat Memory / Skill / Wiki / CodeGraph；Fixed Binding + ACL；稳定 system / 动态 prefix / tool pull
- paired_with: 第 3 节

## V-004
- reader_question: Letta 的 MemFS 如何控制上下文预算？
- purpose: 展示 `/memory/system` 常驻、目录树常驻、其他 Markdown 按需读取和 Git commit/sync。
- claim_ids: L-002, L-003, L-004, L-005
- source_or_path: Letta MemFS docs and `memory-filesystem.ts`
- render_mode: deterministic-evidence
- exact_text: system/ 每轮加载；目录树；按需读取；commit；shared repository
- paired_with: 第 6 节
