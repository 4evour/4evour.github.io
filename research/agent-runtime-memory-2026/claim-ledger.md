# Claim Ledger

| ID | Type | Claim | Evidence | Confidence | Article Location |
|---|---|---|---|---|---|
| C-001 | INFERENCE | Agent Memory 的核心设计变量是写入权、失效、来源、交付和治理，而不只是存储介质 | EV-M01 + EV-G01 + EV-G02 + EV-L01 + EV-T01 | high | 中心论点 |
| C-002 | FACT | 四套系统的公开实现与文档分别采用资产、记录、时序图和 Git 文件作为主抽象 | `comparison-matrix.md`; source-state.md | high | 四种记忆观 |
| C-003 | OPINION | 选型应先确定每类长期状态的唯一权威来源，再决定是否组合多个系统 | article criteria | medium | 选型 |
| C-004 | OPEN | 四系统在统一 benchmark、统一成本预算和长期冲突数据集上的排序未知 | no independent comparative run | high | 结论 |
| X-001 | INFERENCE | Agent Memory 的核心设计变量是写入权、失效、来源、交付和治理，而不只是存储介质 | EV-M01 + EV-G01 + EV-G02 + EV-L01 + EV-T01 | high | 中心论点 |
| X-002 | INFERENCE | 四套系统主要解决不同系统层，不能用单一功能清单公平排名 | `comparison-matrix.md` | high | 四种记忆观 |
| T-001 | FACT | TencentDB 将 Chat Memory、Skill、Wiki、CodeGraph 统一登记为资产 | `MemoryCore/src/metadata/types.ts` at `97f9465` | high | TencentDB |
| T-002 | FACT | L2/L3 稳定内容和 L1 动态召回进入不同上下文区域 | `MemoryCore/src/core/hooks/auto-recall.ts` at `97f9465` | high | TencentDB |
| T-003 | FACT | 资产访问权限与 Agent 可绑定性由不同函数判断 | `MemoryCore/src/metadata/service/permission-checker.ts` at `97f9465` | high | TencentDB |
| T-004 | FACT | Skill 更新包含资源复制、版本、幂等和失败清理 | `MemoryCore/src/core/skill/skill-versioning.ts` at `97f9465` | high | TencentDB |
| T-005 | FACT | Wiki/CodeGraph 通过只读白名单工具按需暴露 | `MemoryKnowledge/src/routes/tools.ts` at `97f9465` | high | TencentDB |
| T-006 | FACT | Proxy injection 失败时回退原始请求 | `MemoryProxy/src/handler.ts` at `97f9465`, lines around 1054-1085 | high | TencentDB |
| T-007 | FACT | Team Memory 为 Beta，自动路由、私有仓库/SSH 接入仍在完善 | `README_CN.md` at `97f9465`，访问 2026-08-18 | high | 限制 |
| T-008 | OPEN | PersonaMem 48% 到 76% 的结果未由本文复现 | `README_CN.md`; no reproduced run | high | 限制 |
| M-001 | FACT | Mem0 v3 `add()` 主路径使用单次 LLM 的 ADD-only 抽取 | `mem0/memory/main.py:879-1206`; `mem0/configs/prompts.py:464+`; tests at `001c235` | high | Mem0 |
| M-002 | FACT | Mem0 显式保留 update/delete API，但不由当前自动 add 主路径调用 | `mem0/memory/main.py:1815-1888` at `001c235` | high | Mem0 |
| M-003 | FACT | Mem0 检索融合 semantic、BM25 和 entity boost，可选 reranker | `mem0/memory/main.py:1379-1811` at `001c235` | high | Mem0 |
| M-004 | FACT | OSS expiration 隐藏过期记录；Platform decay 是 0.3x-1.5x 的检索时软排序 | OSS code + Platform decay docs，访问 2026-08-18 | high | Mem0 |
| M-005 | FACT | OSS 调用 `project.update(decay=True)` 明确报错 | `mem0/memory/main.py:458-483`; decay notice test at `001c235` | high | Mem0 |
| M-006 | INFERENCE | ADD-only 用较少破坏性自动化换取更高的冲突积累与显式清理责任 | M-001 + M-002 + M-004 | medium | Mem0 权衡 |
| G-001 | FACT | Graphiti 保存 raw episode，并将派生事实关联回 episode IDs | `graphiti_core/nodes.py:318-350`; `edges.py:263-282` at `10374d6` | high | Graphiti |
| G-002 | FACT | Fact edge 保存 valid/invalid/expired/reference/created 时间 | `graphiti_core/edges.py` at `10374d6` | high | Graphiti |
| G-003 | FACT | 矛盾事实按有效时间失效，旧 edge 保留而非直接删除 | `edge_operations.py:623-847` at `10374d6` | high | Graphiti |
| G-004 | FACT | Graphiti 搜索可组合 BM25、cosine、BFS 与多种 reranker | `graphiti_core/search/search.py:253-440` at `10374d6` | high | Graphiti |
| G-005 | FACT | 官方建议 episode 顺序写入并在后台队列处理 | `graphiti_core/graphiti.py:1050-1059` at `10374d6` | high | Graphiti 成本 |
| G-006 | INFERENCE | Graphiti 是四者中对“事实何时为真、来自哪里”建模最直接的系统 | G-001 + G-002 + G-003 | high | Graphiti 判断 |
| L-001 | FACT | Letta SDK 将 memory blocks/persona/human 标为 deprecated，并默认启用 MemFS | `src/types.ts:917-939`; `src/agent-creation.ts:65-100` at `072b8bf` | high | Letta |
| L-002 | FACT | MemFS 的 `system/` 文件每轮常驻，其余正文按需读，但目录树常驻 | Letta docs `9a8305b`; `memory-filesystem.ts` at `a75f4d9` | high | Letta |
| L-003 | FACT | MemFS 默认不带 semantic/vector index | `concepts/memfs/index.md` at `9a8305b` | high | Letta 限制 |
| L-004 | FACT | memory tool 每次有效写入形成 commit，并有路径、只读和 dirty repo 防护 | `letta-code/src/tools/impl/memory.ts` at `a75f4d9` | high | Letta |
| L-005 | FACT | memory subagent 用 worktree 重组记忆；shared repo 允许多 Agent 共享 Git 文件 | Letta Code memory subagent + shared memory docs | high | Letta |
| L-006 | FACT | SDK 注释提示启用 MemFS 是慢后端往返，多会话共享会争用 Git state | `src/types.ts:933-937` at `072b8bf` | high | Letta 成本 |
| L-007 | INFERENCE | Letta 把记忆质量控制从集中抽取算法转移到 Agent 可执行、可审计的维护工作流 | L-001 + L-002 + L-004 + L-005 | high | Letta 判断 |
| X-003 | OPINION | 选型应先确定每类长期状态的唯一权威来源，再决定是否组合多个系统 | article criteria | medium | 选型 |
| X-004 | OPEN | 四系统在统一 benchmark、统一成本预算和长期冲突数据集上的排序未知 | no independent comparative run | high | 结论 |
