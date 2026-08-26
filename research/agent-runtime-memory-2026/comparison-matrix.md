# Comparison Matrix

| Dimension | TencentDB Agent Memory | Mem0 OSS / Platform | Graphiti | Letta Agent SDK + MemFS |
|---|---|---|---|---|
| 主抽象 | 团队 Memory Asset 与 Agent loadout | 有 scope 的可检索 memory record | 动态 temporal context graph | 有状态 Agent 自有的 Git memory repository |
| 记忆单元 | Chat L0-L3、Skill、Wiki、CodeGraph | 抽取后的文本记录、metadata、entity link | Episode、Entity、Fact Edge、Community | Markdown 文件、目录、commit；legacy block |
| 写入者 | 异步 Pipeline、Agent、用户/管理员 | 默认单次 LLM ADD-only；应用显式 CRUD | ingest pipeline + LLM resolution | Agent 用文件/memory tools；用户、dreaming/subagent 可触发 |
| 更新/冲突 | 各资产独立；Skill 版本化；无统一事实时间模型 | 自动写入累积；显式 update/delete；hash 去重 | dedupe + contradiction invalidation；保留旧事实 | 文件编辑 + Git history/conflict；语义冲突由 Agent 整理 |
| 时间/遗忘 | L0-L3 周期、资产状态；未见统一双时态 | OSS expiration 硬隐藏；Platform decay 软降权 | valid/invalid/expired/reference/created 时间 | Agent 删除、归档、重组；Git 保留历史；dreaming 整理 |
| 检索 | Hybrid recall；Knowledge 工具查询 | semantic + BM25 + entity boost + optional reranker | BM25 + cosine + BFS，RRF/MMR/CE | 文件树 + 普通读取/搜索；语义搜索需额外 mod |
| 上下文交付 | 稳定 system + 动态 prefix + tool pull + fixed binding | 返回结果给应用，应用负责 prompt assembly | 返回 graph objects/facts，应用负责 assembly | `system/` 常驻；目录树常驻；正文按需读 |
| 来源追溯 | 资产 Owner/版本较强；Chat fact provenance 非统一核心 | history 表记录 CRUD；抽取记录 provenance 有限 | episode IDs 是事实 edge 的一等字段 | Git commit/diff 提供修改历史；内容事实来源需 Agent 记录 |
| 共享治理 | Team、Owner、visibility、ACL、Agent binding | 以 user/agent/run 和 metadata scope 为主；平台有 workspace 能力 | group_id 隔离；完整治理需自建或用 Zep | Agent-owned MemFS；Cloud shared repo 支持 attachment 与 read/read_write |
| 耦合 | 多服务控制面 + Proxy/SDK | 可嵌入 SDK/服务，接入较轻 | 图引擎，需要图数据库与模型服务 | Agent Runtime/SDK，记忆与 Agent identity 强绑定 |
| 运营成本 | 最高：多服务、多存储、队列、代理和权限 | 中低：LLM、embedding、向量/关键词/entity store | 高：图数据库、顺序 ingest、LLM/embedding、多路检索 | 中高：Agent runtime、Git sync、上下文与整理 token、并发冲突 |
| 更强的条件 | 多 Agent/多人共享异构经验且需要治理 | 个性化事实、快速接入、应用掌控注入 | 事实持续变化且需要时间与来源追溯 | 长期自治 Agent 需要可读、可编辑、可版本化的自有状态 |
| 不适合 | 单 Bot 少量偏好 | 强时间推理或复杂团队资产治理 | 轻量偏好记忆、无图数据库团队 | 只需无状态 API 检索或不愿让 Agent 修改长期状态 |

## Fair Comparison Notes

- Mem0 的 decay、temporal reasoning、graph memory 等文档中明确标为 Platform 的能力，不归入 OSS。
- Zep 的托管规模、用户/线程管理和 SLA 不归入 Graphiti OSS。
- Letta legacy block API 仍存在，但当前 SDK 推荐 MemFS；两者都写明，不能只选有利的一侧。
- TencentDB 当前是快速迭代的 Beta 控制面，不以 README benchmark 代替独立验证。
