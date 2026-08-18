---
title: "Agent Memory 还没有标准答案：TencentDB、Mem0、Graphiti、Letta 的四种记忆观"
subtitle: "真正需要比较的不是向量库，而是谁有权写入长期状态、旧事实如何失效，以及记忆如何回到 Agent"
research_path: "research/agent-runtime-memory-2026"
research_commit: "multi-project; see source-state.md"
research_date: "2026-08-18"
audience: "Agent、RAG 与 AI 系统工程师"
status: draft
---

# Agent Memory 还没有标准答案

最近的 Agent Memory 讨论，常常从一个熟悉的问题开始：选哪种向量数据库，embedding 用多大，top-k 取多少。

这些问题当然重要，但它们还没有碰到最难的部分。真正棘手的是：一个 Agent 今天记下“用户喜欢咖啡”，下周用户又说“我改喝茶”，系统应该怎样处理？是把旧记录覆盖掉，追加一条新记录，让旧事实在时间线上失效，还是让 Agent 编辑一份记忆文件并提交版本？如果这条信息属于团队经验，谁可以看到，谁可以把它装配给另一个 Agent？

我的阅读是，Agent Memory 首先不是数据库选型，而是长期状态的权力与生命周期设计。它至少要回答五件事：谁能写，什么算一个记忆单元，冲突如何处理，证据如何保留，哪些内容以什么形状进入上下文。

TencentDB Agent Memory、Mem0、Graphiti 和当前 Letta Agent SDK 恰好给出了四种不同答案。它们不是同一道题的四个竞品实现，而是把不同系统层放在了中心：团队资产治理、紧凑记忆记录、时间化事实图、Agent 自治状态。

> 本文依据 2026 年 8 月 18 日固定的源码和官方文档状态。没有执行四套系统的完整部署，也没有复现项目方 benchmark。文中关于质量、吞吐和成本的比较是设计层判断，不是统一实验结果。

关键实现入口包括 `MemoryCore/src/metadata/types.ts`、`mem0/memory/main.py`、`graphiti_core/graphiti.py` 和 `letta-agent-sdk/src/types.ts`，具体提交与辅助仓库见文末研究包。

## 先建立一套比较方法

读一个 Memory 系统，我会沿着下面这条链路追：

~~~text
输入事件
  -> 判断什么值得长期保存
  -> 形成记忆对象
  -> 去重、冲突、时间与版本处理
  -> 持久化
  -> 查询与排序
  -> 上下文交付
  -> 反馈、遗忘或重组
~~~

然后问七个具体问题：

1. 主抽象是什么，记录、图、文件、资产，还是它们的组合？
2. 默认写入者是谁，后台模型、应用、Agent，还是管理员？
3. 新事实出现时，系统追加、覆盖、失效还是生成新版本？
4. 时间表示事件发生时间、系统写入时间，还是两者都有？
5. 检索结果如何进入上下文，系统常驻、动态前缀、工具调用还是 Agent 主动读取？
6. 共享和权限在哪里执行，搜索时、装配时、文件同步时，还是根本不负责？
7. 遗忘是删除、硬过期、软降权、归档，还是由 Agent 自己重组？

这套问题会得到一张与“功能列表”完全不同的地图。

| 系统 | 它首先把 Memory 看成什么 | 默认解决的主要问题 |
|---|---|---|
| TencentDB Agent Memory | 团队可治理、可装配的经验资产 | 多 Agent 如何共享不同类型的经验 |
| Mem0 | 有 scope 的可检索记忆记录 | 怎样把对话压缩成可查询的个性化事实 |
| Graphiti | 带时间窗口和来源的上下文图 | 事实变化后，怎样知道什么现在为真 |
| Letta + MemFS | Agent 自有的 Git 记忆仓库 | Agent 如何读写、版本化和整理自己的长期状态 |

## TencentDB：把经验变成团队可装配资产

TencentDB 最值得看的地方，不是它又实现了一个向量检索接口，而是它把“记忆”拆成了四种不同资产：Chat Memory、Skill、Wiki 和 CodeGraph。当前默认分支的 [AssetType、AssetEntity 和 FixedAssetBindingEntity](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/97f94654280b2932c35ba4806a491999ed244cc9/MemoryCore/src/metadata/types.ts) 统一登记了资产类型、Owner、Team、Visibility、版本、注入模式和 Agent Binding，但没有强行把四类资产压成同一种底层记录。

这意味着它的主抽象其实是控制面。Chat Memory 可以保存跨会话事实，Skill 是带资源目录和版本的程序性知识，Wiki 和 CodeGraph 则更像外部知识资产。统一的是身份、权限和装配关系，底层构建和读取方式仍然不同。

### 记住之后，还要决定怎么交付

TencentDB 的 Chat Memory 仍然有 L0 到 L3 的分层。更有意思的是召回阶段：[auto-recall.ts](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/97f94654280b2932c35ba4806a491999ed244cc9/MemoryCore/src/core/hooks/auto-recall.ts) 把相对稳定的 L2/L3 放到 system context，把每轮变化的 L1 放进动态 user prefix，并对检索设置超时、条数和字符预算。

这不是简单地“把更多记忆塞进 prompt”，而是把稳定概览和动态细节放在不同的上下文位置。我的理解是，它在同时优化三件事：让 Agent 看到足够的背景，避免每轮重复传输稳定内容，以及给动态召回留出可控预算。真实 KV cache 收益仍取决于模型服务商和请求形态，源码本身不能证明这个收益一定出现。

Wiki 和 CodeGraph 走的是另一条路径。Agent 先通过 [MemoryKnowledge/src/routes/tools.ts](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/97f94654280b2932c35ba4806a491999ed244cc9/MemoryKnowledge/src/routes/tools.ts) 的白名单发现工具，再按需搜索页面、读取代码或探索 callers、callees 和 impact。知识不必整库注入，Agent 也不会因此获得管理操作。

### 团队记忆的难点是装配，不只是可见

[permission-checker.ts](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/97f94654280b2932c35ba4806a491999ed244cc9/MemoryCore/src/metadata/service/permission-checker.ts) 把“用户能不能操作资产”和“资产能不能绑定给目标 Agent”拆成两个判断。这个区分非常关键：一个人能读一份 Skill，不代表他可以把这份 Skill 装配到所有 Agent 上。

Skill 更新也不是替换一段 Prompt。[skill-versioning.ts](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/97f94654280b2932c35ba4806a491999ed244cc9/MemoryCore/src/core/skill/skill-versioning.ts) 会复制旧资源、应用资源变化、创建新版本，在失败时清理目录，内容未变化时保持幂等。这里的记忆单元已经接近一个可审查的软件资产。

这套设计的代价同样清楚：多服务、异步构建、权限、队列、Proxy 和多种存储共同组成了较大的运维面。当前 README 仍把 Team Memory 标为 Beta，自动路由、私有仓库和 SSH 接入也在完善。它适合需要多人、多 Agent 共享异构经验的团队，不适合只有少量偏好记忆的单 Bot。

## Mem0：把事实变成可追加的记忆记录

关于 Mem0，最容易过时的是沿用早期“四个操作由 LLM 决定”的文章。当前 main 的 OSS v3 写入路径已经发生了变化。

[Memory._add_to_vector_store](https://github.com/mem0ai/mem0/blob/001c235229be8795e3834520467bd0d661ed8f34/mem0/memory/main.py#L879-L1206) 先读取最近消息和相似旧记忆，再用一次 LLM 调用生成新增记忆。随后代码批量生成 embedding、用 hash 去重、写入向量存储和 history，并统一返回 event: ADD。对应的 [ADDITIVE_EXTRACTION_PROMPT](https://github.com/mem0ai/mem0/blob/001c235229be8795e3834520467bd0d661ed8f34/mem0/configs/prompts.py#L464-L960) 甚至明确把操作限定为 ADD。

这是一种很有意图的保守性：自动抽取不会因为一次模型判断就直接删掉一条旧记忆。显式的 [update() 和 delete()](https://github.com/mem0ai/mem0/blob/001c235229be8795e3834520467bd0d661ed8f34/mem0/memory/main.py#L1815-L1905) 仍然存在，但它们是应用或上层工作流调用的 API，不是当前自动 add() 主路径的隐式副作用。

仓库里仍保留旧的 DEFAULT_UPDATE_MEMORY_PROMPT，而 add() 的 docstring 也还写着会决定 add、update、delete。这正是研究快速迭代项目时不能只搜 prompt 的原因：运行路径、测试和新版文档才共同决定当前行为。Mem0 Add 文档已经把 OSS 和 Platform 的 Add behavior 都写成 ADD-only。

### 记录不是只有向量

Mem0 当前 OSS 的搜索也比“向量库封装”丰富。[Memory._search_vector_store](https://github.com/mem0ai/mem0/blob/001c235229be8795e3834520467bd0d661ed8f34/mem0/memory/main.py#L1628-L1731) 同时执行 semantic search 和 keyword search；查询还会抽取实体，通过 entity store 找到关联的 memory，再把 entity boost 交给 score_and_rank。启用 explain 时，可以看到 semantic、BM25、entity 和最终分数的明细。

记录也有明确 scope。user_id、agent_id、run_id 进入 filters，metadata 不能覆盖创建时的身份字段。这样做的优点是接入简单，应用可以决定每次把哪个用户、Agent 或运行范围交给搜索；代价是上下文装配和跨 scope 治理仍然主要由应用负责。

### 不要把 Platform 的遗忘能力写成 OSS 能力

OSS 支持 expiration_date。过期记录默认从 search 和 get_all 隐藏，这更接近硬过期。Platform 的 Memory Decay 是另一种语义：官方文档描述它在搜索时把分数乘以约 0.3 到 1.5 的缩放因子，并记录访问历史；它不删除候选，也不改变存储内容。

而在当前 OSS 代码中，project.update(decay=True) 会明确抛出不支持错误，相关测试也锁定了这个边界。把 decay、temporal reasoning 或 graph memory 从 Platform 文档直接搬到 OSS 文章里，会得到一个看似完整但事实错误的 Mem0。

我的判断是，Mem0 现在把“自动写入的破坏性”降下来了，却把冲突清理责任显式化了。对于个性化偏好，这是很务实的折中；对于不断变化的业务事实，则需要额外的更新、过期或审查工作流。

## Graphiti：把变化中的真相变成时间化事实图

Graphiti 解决的是另一个问题。它不把长期状态主要看成互相独立的文本记录，而是保留产生事实的 episode，再从 episode 派生实体和关系。

调用 [Graphiti.add_episode](https://github.com/getzep/graphiti/blob/10374d6044f91b9ecae3586828abb1ecbf022c4f/graphiti_core/graphiti.py#L980-L1228) 时，系统保存 episode 的原始内容、来源类型、来源描述、创建时间和参考时间，接着抽取并解析 nodes、edges，生成实体摘要，最后把 episode、节点、边和失效边一起写入图。官方 docstring 还建议 episode 按顺序添加，并把这项工作放在后台队列中。

### “旧事实不是真的了”不等于删除

[EntityEdge](https://github.com/getzep/graphiti/blob/10374d6044f91b9ecae3586828abb1ecbf022c4f/graphiti_core/edges.py#L263-L295) 保存 fact、episodes、valid_at、invalid_at、expired_at 和 reference_time。这里至少有两种时间：事实在现实世界何时成立，以及系统何时接收到并处理了它。[resolve_extracted_edge](https://github.com/getzep/graphiti/blob/10374d6044f91b9ecae3586828abb1ecbf022c4f/graphiti_core/utils/maintenance/edge_operations.py#L623-L847) 会把新事实与相同端点的旧边交给去重和矛盾解析；较旧的冲突边被标记失效，但不会直接从历史中抹掉。

这让 Graphiti 能表达两种经常被混淆的查询：现在什么是真的，以及某个历史时刻什么是真的。它也让 provenance 成为查询结果的一部分，而不是写入时顺手丢掉的日志。

### 图只是数据模型，检索仍是一条工程链

[Graphiti edge_search](https://github.com/getzep/graphiti/blob/10374d6044f91b9ecae3586828abb1ecbf022c4f/graphiti_core/search/search.py#L253-L440) 可以并行执行 BM25、cosine similarity 和 BFS。随后根据配置选择 RRF、MMR、cross-encoder 或 node distance。当前实现会先用 RRF 合并候选，再把最多 2 * limit 个 edge 交给 cross-encoder，相关回归测试专门验证了不同召回路的候选不会被某一路吞掉。

这解释了 Graphiti 的强项，也说明了它的成本：图数据库、embedding、LLM 抽取、候选召回和排序每一层都可能失败。Graphiti OSS 负责图引擎本身，不负责完整的用户、会话和企业治理；README 中关于百万级图、低延迟和 SLA 的描述属于 Zep 的托管产品，不能直接归给开源库。

如果你的核心问题是“客户地址变更后，旧地址何时失效，以及这个判断来自哪次对话”，Graphiti 的数据模型比一组孤立的向量记忆更接近问题本身。它并不因此自动得到更高召回质量，抽取错误和候选漏召回仍然会把错误事实写进图。

## Letta：让 Agent 自己维护一份版本化记忆仓库

如果只看旧文章，Letta 常被概括为拥有 always-visible memory blocks 的 stateful agent。当前 SDK 已经在转向另一个更完整的模型。

在 [CreateAgentOptions](https://github.com/letta-ai/letta-agent-sdk/blob/072b8bf07dac806c1f5e15118ed0e483fb2f7ecc/src/types.ts#L895-L939) 中，memory、persona 和 human 都被标为 deprecated，注释明确建议使用 Git-backed memory filesystem；memfs 默认值是 true。[createAgentBody](https://github.com/letta-ai/letta-agent-sdk/blob/072b8bf07dac806c1f5e15118ed0e483fb2f7ecc/src/agent-creation.ts#L65-L100) 会把它转换成创建请求的 enableMemfs 字段。旧 block API 还在，但已经不是最新推荐的主抽象。

### 路径本身就是上下文策略

Letta 的 MemFS 是 Agent 自己拥有的一份 Git 仓库。[当前官方文档镜像](https://github.com/letta-ai/letta-docs-md/blob/9a8305b954ffac89db8cf325693f928fba8f3bb7/concepts/memfs/index.md) 把它描述成“把仓库投影到 Agent 正在使用的计算机上”：

- system/ 下的 Markdown 文件每一轮进入 system prompt，适合身份、关键偏好和必须遵守的规则。
- 其他文件的正文不常驻，但文件树会出现在上下文里，Agent 根据路径和文件名决定什么时候读取。
- 默认没有 semantic 或 vector index。需要关键词、语义或混合搜索时，另装 MemFS Search mod。

这是一种很特别的检索设计。系统不先替 Agent 猜 top-k，而是给它一个可导航的目录，让 Agent 主动选择要读的文件。它牺牲了“对模糊问题自动找全”的便利，换来了可读的结构和较明确的上下文预算。

### 写入记忆就是一次可审计的工作流

Letta Code 发布版对应的 [memory tool](https://github.com/letta-ai/letta-code/blob/a75f4d93ef1c61946c7f3e4dec2b3ecf17c17680/src/tools/impl/memory.ts#L98-L153) 支持 create、str_replace、insert、delete 和 rename。每次有效变更都会检查仓库状态、写入文件、生成 Git commit，并根据后端模式在 turn 后同步。路径遍历、只读文件和 dirty repo 也有明确保护。

于是“记忆更新”不再只是后台 API 的副作用，而是 Agent 可以执行、查看 diff、回滚和审查的工作流。memory subagent 还会利用 Git worktree 分拆大文件、合并重复事实和重组层级；dreaming 则在后台回顾对话并更新记忆。

共享也沿着 Git 边界实现。Letta 的 shared memory repository 可以附加给多个 Cloud Agent，并设置 read 或 read_write 权限。它和 Agent 自己的 MemFS 是两种所有权：前者属于组织，后者属于单个 Agent。

代价同样写在 SDK 注释里：启用 MemFS 会增加后端往返，多会话共用 MemFS 会争用 Git state。Git 能告诉我们谁在什么时候改了哪一行，却不能自动证明某条事实是真的；记忆质量最终依赖 Agent 的判断、整理和审查行为。

## 同一个需求，四种后果

假设用户先说“我喜欢咖啡”，后来改成“我现在更喜欢茶”。四个系统不会产生同一种状态：

| 系统 | 可能的当前路径 | 留下的责任 |
|---|---|---|
| Mem0 | v3 自动 add 追加新的上下文丰富事实；旧记录不会被自动删除，应用可显式 update/delete | 定期处理重复、冲突和过期记录 |
| Graphiti | 新 edge 带有效时间进入图，矛盾解析让旧 edge 写入 invalid_at，原 episode 继续保留 | 确保冲突候选被召回且时间抽取正确 |
| Letta | Agent 修改对应 Markdown 文件并提交 Git；历史 diff 可回看 | 让 Agent 正确判断哪些偏好是长期的 |
| TencentDB | Chat Memory 按分层 pipeline 沉淀；如果是团队规则或做法，还可能进入 Skill 等不同资产，并由 binding 与 ACL 决定交付 | 明确不同资产之间的权威和审核边界 |

这不是谁“实现得更完整”的问题，而是四种错误模式：Mem0 可能积累矛盾记录，Graphiti 可能抽取错时间，Letta 可能让 Agent 写错长期状态，TencentDB 可能让跨资产治理变复杂。架构评审应该先选择自己愿意承担哪一种错误。

## 怎么选，怎么组合

### 适合 Mem0 的场景

单用户或单 Agent 的个性化事实、偏好和轻量跨会话状态。你希望快速接入，保留应用对 scope、filters 和 prompt assembly 的控制，也愿意自己负责清理和更新。

### 适合 Graphiti 的场景

业务事实持续变化，并且查询需要回答“何时成立、何时失效、来自哪个 episode”。例如客户关系、设备状态、组织关系和带历史的决策记录。你需要接受图数据库和抽取链路的运营成本。

### 适合 Letta 的场景

Agent 本身就是长期运行的主体，需要跨会话、模型和设备保持身份、工作方法和项目上下文，并且你愿意让 Agent 直接维护可读、可版本化的文件。不要把它当成一个无状态的记忆 API。

### 适合 TencentDB 的场景

多个成员和多个 Agent 要共享 Chat Memory、Skill、文档和代码知识，而且团队需要 Owner、ACL、版本和定向装配。你接受 Beta 组件、多服务部署和异步最终一致性。

### 组合时先写 ownership matrix

四套系统可以组合，但不要让它们同时对同一类事实拥有写权限。一个可行的起点是：

1. 为每种长期状态指定唯一权威来源，例如用户偏好由 Mem0 负责，时序业务事实由 Graphiti 负责，Agent 工作方法由 Letta 或 TencentDB Skill 负责。
2. 其他系统只能读取派生视图，不能把派生结果写回另一个真相源。
3. 为失效和删除定义单向事件，而不是在多个系统里各自猜测“现在应该是什么”。
4. 记录 provenance、版本和同步失败，允许从原始事件重建派生记忆。
5. 单独测量记忆增强失败时主 Agent 是否还能工作。

## 结论：没有标准答案，但有标准问题

目前没有一个项目同时在轻量接入、时间事实、Agent 自治和团队治理上都占优，也没有统一实验能证明它们在相同成本下的质量排序。

但这四个项目共同说明了一件事：Agent Memory 的下一阶段，不会只是把更多历史文本放进更大的向量库。系统必须明确长期状态的权威、写入权、冲突处理、时间、来源、上下文位置和共享边界。

如果你正在设计一个新 Agent，最值得先写下来的不是数据库 schema，而是下面这句话：

> 对于这类记忆，谁有权把什么写成长期状态；当它不再成立时，系统要删除、失效、降权、归档，还是提交一个新版本？

这个问题回答清楚之后，TencentDB、Mem0、Graphiti 和 Letta 才会从“热门项目”变成可以被理性选择的系统部件。
