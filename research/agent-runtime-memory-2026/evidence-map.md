# Evidence Map

## Source State

研究对象、exact commit、发布依赖和证据边界见 `source-state.md`。所有 GitHub 易变事实访问日期为 2026-08-18。

## README Reuse Map

| Source | Content | Decision | Reason |
|---|---|---|---|
| TencentDB README | Chat Memory、Skill、Wiki、CodeGraph；Fixed Binding + ACL | adapt + verify | 用类型、权限和工具路由源码解释 |
| Mem0 docs | v3 ADD-only、contextual add、OSS/Platform 区分 | reuse + verify | 与当前 `main.py`、prompt 和测试一致 |
| Mem0 Memory Types | 四层自动提升与合并 | verify / exclude | OSS 代码主要通过 ID scope 和 metadata 实现，自动 promotion 证据不足 |
| Graphiti README | temporal graph、episode provenance、hybrid search | adapt + verify | 用 edge 字段、冲突处理和 search pipeline 支撑 |
| Graphiti README | 生产规模、低延迟、SOTA | exclude | 未复现，且部分属于托管 Zep |
| Letta docs | Stateful Agent、MemFS、system 常驻、Git 版本 | reuse + verify | 与 SDK 类型和 Letta Code tag 一致 |
| Letta v1 blocks docs | always-visible blocks | historical context | 当前 SDK 已标 legacy |

## Official Claims

- TencentDB 将自己定位为共享四类经验资产的 Memory Hub，并明确 Team Memory 仍为 Beta。
- Mem0 当前 Add 文档明确写为 ADD-only；显式 CRUD 独立存在。
- Graphiti 将自己定位为 temporal context graph engine；Zep 是另外的托管生产基础设施。
- Letta 将 stateful agent 定义为跨会话、模型和计算机保持身份与记忆的持久实体；当前推荐模型是 MemFS。

## Architecture

| System | Primary abstraction | Write authority | Conflict/time model | Delivery model |
|---|---|---|---|---|
| TencentDB | 四类可治理 Memory Asset | Pipeline、Agent、Owner/Admin | 各资产分别处理；无统一双时态事实模型 | 固定装配 + 自动召回 + 只读工具拉取 |
| Mem0 | 有 scope 的 memory record | 单次 LLM 新增；显式 API 更新/删除 | v3 自动写入 ADD-only；expiration 硬隐藏，Platform decay 软排序 | 语义 + BM25 + entity boost，应用负责注入 |
| Graphiti | Episode、Entity、时序 Fact Edge | ingest pipeline + LLM resolution | valid/invalid/expired；矛盾事实失效但保留 | BM25、向量、BFS 后 RRF/MMR/cross-encoder |
| Letta | Agent 自有 Git memory repository | Agent、用户、dreaming/subagent | Git history/conflict；语义由 Agent 工作流负责 | `system/` 常驻，目录树常驻，正文按需读 |

```text
输入事件 -> 判断长期价值 -> 形成记忆对象 -> 处理重复/冲突/时间
        -> 持久化与版本 -> 查询/选择 -> 上下文交付 -> 反馈、遗忘或重组
```

## Code Evidence

### EV-T01 - TencentDB 统一治理四类资产，而非统一底层模型
- Path: `MemoryCore/src/metadata/types.ts`
- Symbol: `AssetType`, `AssetEntity`, `FixedAssetBindingEntity`
- Observation: 类型包含四类资产及 Owner、Team、Visibility、版本、注入模式和 Agent Binding。
- Meaning: 系统的辨识度在资产控制面，而不是一种向量记录。
- Alternative explanation: 元数据统一不等于事务、时间或来源语义统一。
- Confidence: high

### EV-T02 - TencentDB 分离稳定概览和动态召回
- Path: `MemoryCore/src/core/hooks/auto-recall.ts`
- Symbol: `performAutoRecallCore`, `searchMemories`, `applyRecallBudget`
- Observation: L2/L3 进入稳定 system context；L1 进入动态 user prefix；召回有超时、条数和字符预算。
- Meaning: 交付同时考虑信息价值、上下文预算和缓存稳定性。
- Alternative explanation: 实际缓存收益取决于模型服务商和请求形态。
- Confidence: high

### EV-T03 - 可访问与可装配是两个权限问题
- Path: `MemoryCore/src/metadata/service/permission-checker.ts`
- Symbol: `checkPermission`, `canBindAsset`
- Observation: 用户能否操作资产和资产能否绑定给 Agent 由不同函数判断。
- Meaning: 团队 Memory 需要同时控制“谁能看”和“谁能带走”。
- Alternative explanation: 规则存在不证明所有入口均正确执行。
- Confidence: high

### EV-T04 - Skill 版本化，Knowledge 按需读取
- Path: `MemoryCore/src/core/skill/skill-versioning.ts`; `MemoryKnowledge/src/routes/tools.ts`
- Symbol: `appendNextVersion`, `WIKI_TOOLS`, `CODE_GRAPH_TOOLS`
- Observation: Skill 更新复制资源、生成版本并失败清理；Wiki/CodeGraph 通过白名单工具读取。
- Meaning: 不同经验采用不同持久化和消费方式。
- Alternative explanation: 版本存在不等于内容质量已验证。
- Confidence: high

### EV-T05 - 增强失败不阻断模型请求
- Path: `MemoryProxy/src/handler.ts`
- Symbol: `handleChatCompletions`
- Observation: injection 异常为 non-fatal，回退原 body；L0 写入有跟踪和重试路径。
- Meaning: Memory 增强不成为模型主链路的硬依赖。
- Alternative explanation: Proxy 仍扩大了集中故障面。
- Confidence: high

### EV-M01 - Mem0 v3 自动写入是单次 LLM、ADD-only
- Path: `mem0/memory/main.py`; `mem0/configs/prompts.py`; `tests/memory/test_main.py`
- Symbol: `Memory._add_to_vector_store`, `ADDITIVE_EXTRACTION_PROMPT`
- Observation: 主路径读取最近消息和相似旧记忆，经单次 LLM 生成新增记忆，再批量 embed、去重、insert，统一返回 `event: ADD`。
- Meaning: 自动抽取不再直接覆盖或删除过去，修订被移到显式 CRUD 或上层工作流。
- Alternative explanation: 仓库保留旧四操作 prompt，但当前 `add()` 主路径未调用。
- Confidence: high

### EV-M02 - Mem0 检索不是单一向量相似度
- Path: `mem0/memory/main.py`
- Symbol: `_search_vector_store`, `_compute_entity_boosts`
- Observation: semantic search、keyword search、query entity extraction 和 entity-to-memory boost 由 `score_and_rank` 融合；可返回解释字段。
- Meaning: OSS 是紧凑的记忆检索服务，而非向量库薄封装。
- Alternative explanation: 最终候选仍从 semantic results 建集，关键词不独立扩大候选全集。
- Confidence: high

### EV-M03 - OSS expiration 与 Platform decay 语义不同
- Path: `mem0/memory/main.py`; `docs/platform/features/memory-decay.mdx`; `tests/memory/test_decay_feature_notice.py`
- Symbol: `_payload_is_expired`, `_OSSProject.update`
- Observation: OSS 可隐藏过期记录，且 `project.update(decay=True)` 明确报错；Platform decay 只缩放搜索分数，不删除或过滤。
- Meaning: 遗忘要区分硬过期和软降权，也要区分 OSS 与 Platform。
- Alternative explanation: Platform 实现闭源，只能作为官方文档事实。
- Confidence: high

### EV-G01 - Graphiti 保留 raw episode 和派生来源
- Path: `graphiti_core/graphiti.py`; `graphiti_core/nodes.py`; `graphiti_core/edges.py`
- Symbol: `Graphiti.add_episode`, `EpisodicNode`, `EntityEdge`
- Observation: episode 保存 source、raw content、created_at、valid_at；事实 edge 保存 episode IDs。
- Meaning: 派生事实可回到原始输入，不把摘要当唯一真相。
- Alternative explanation: provenance 存在不代表抽取正确。
- Confidence: high

### EV-G02 - Graphiti 用有效期表达事实变化
- Path: `graphiti_core/edges.py`; `graphiti_core/utils/maintenance/edge_operations.py`
- Symbol: `EntityEdge`, `resolve_extracted_edge`, `resolve_edge_contradictions`
- Observation: edge 保存 valid/invalid/expired/reference time；冲突解析让旧事实失效而非物理删除。
- Meaning: 能区分“现在为真”和“当时为真”。
- Alternative explanation: 时间与矛盾仍依赖 LLM 抽取和候选召回。
- Confidence: high

### EV-G03 - Graphiti 多路召回并显式 rerank
- Path: `graphiti_core/search/search.py`; `tests/utils/search/test_edge_cross_encoder_rrf_shortlist.py`
- Symbol: `edge_search`, `search`
- Observation: 可组合 BM25、cosine、BFS；RRF、MMR、cross-encoder 或 node distance 排序。
- Meaning: 图不是检索本身，仍需候选融合与排序工程。
- Alternative explanation: 本文未独立复现延迟与质量。
- Confidence: high

### EV-L01 - Letta 推荐 MemFS，memory blocks 成为兼容层
- Path: `letta-agent-sdk/src/types.ts`; `letta-agent-sdk/src/agent-creation.ts`
- Symbol: `CreateAgentOptions`, `createAgentBody`
- Observation: `memory/persona/human` 标为 deprecated；`memfs` 默认 true。
- Meaning: 用 always-visible blocks 解释当前 Letta 已过时。
- Alternative explanation: block API 仍受支持。
- Confidence: high

### EV-L02 - 路径决定常驻或按需读取
- Path: `letta-docs-md/concepts/memfs/index.md`; `letta-code/src/agent/memory-filesystem.ts`
- Symbol: `renderMemoryFilesystemTree`
- Observation: `system/` 文件每轮进入 system prompt；其他正文不常驻，但目录树常驻。
- Meaning: 默认检索是可见目录 + Agent 主动读取，而不是向量召回。
- Alternative explanation: 大规模模糊检索时需额外 search mod。
- Confidence: high

### EV-L03 - Memory tool 的有效写入形成 Git commit
- Path: `letta-code/src/tools/impl/memory.ts`
- Symbol: `memory`, `applyMemoryCommand`
- Observation: create/replace/insert/delete/rename 后检查变更并提交；路径遍历、只读和 dirty repo 有保护。
- Meaning: 版本、审计和回滚由 Git 提供，记忆维护成为 Agent 工作流。
- Alternative explanation: Git 不判断内容是否真实或值得保留。
- Confidence: high

### EV-L04 - 整理与共享使用版本化工作流
- Path: `letta-code/src/agent/subagents/builtin/memory.md`; Letta shared-memory docs; `letta-agent-sdk/src/agent-repositories.ts`
- Symbol: memory subagent, `createAgentRepositoriesClient`
- Observation: subagent 用 worktree 重组文件；shared repository 可按 read/read_write 权限附加给 Agent。
- Meaning: 遗忘、整理、共享是可审查的仓库操作。
- Alternative explanation: Cloud shared repo 和多会话共享 memfs 会带来 Git 争用。
- Confidence: high

## Engineering Evidence

- TencentDB 关键模块有 build/test/typecheck 脚本，但当前 PR CI 不执行完整检查，公开分支缺少对应测试源码；PersonaMem 未复现。
- Mem0 测试覆盖 v3 单次抽取、时间戳、identity scope、entity boost 并发和 OSS decay 边界；本轮未执行。
- Graphiti 建议 episode 顺序写入并放入后台队列；多路检索、安全 filter 和 shortlist 有测试；本轮未执行。
- Letta SDK/Code 对路径、Git hook、重试、worktree、并发和 confinement 有大量测试；本轮未执行。

## Limitations

- TencentDB 覆盖最广，运维面也最大；统一治理不等于统一事实冲突与 provenance。
- Mem0 ADD-only 降低自动破坏风险，但把合并和失效留给显式 CRUD、expiration 或应用层。
- Graphiti 需要图数据库、LLM 抽取、embedding 和顺序 ingest；完整用户与企业治理需另建。
- Letta 正确整理依赖 Agent；默认无语义索引，`system/` 消耗固定上下文，多会话会争用 Git 状态。

## Contradictions

- Mem0 `add()` docstring 仍写 add/update/delete，仓库也保留旧 prompt；但当前 v3 主路径、测试和 Add 文档均为 ADD-only。本文采用运行路径结论。
- Letta v1 blocks 文档仍可访问，但当前 SDK 已 deprecated；本文将其视为兼容机制。
- TencentDB 说统一路由四类资产，同时承认全自动路由仍在迭代；Fixed Binding 与人工治理仍关键。
- Graphiti README 混合描述 Graphiti 与 Zep；托管规模和 SLA 不归入 OSS。

## Open Questions

详见 `open-questions.md`。核心未知是长期错误写入、冲突积累、上下文收益、维护成本和多租户隔离。
