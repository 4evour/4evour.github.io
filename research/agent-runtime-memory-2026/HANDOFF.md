# Research Handoff

更新时间：2026-08-19

## 当前状态

四项目研究包和专业文章初稿已经完成，研究与文章结构校验均通过。当前主稿：

- `article.md`：完整长文初稿，状态 `draft`
- `article-purpose.md`：文章目的与读者认知转变
- `argument-map.md`：中心论点、证据层级和反论点
- `outline.md`：当前正式结构
- `visual-brief.md`：四项视觉证据计划
- `editorial-review.md`：事实边界和剩余编辑风险

研究事实边界由 `source-state.md`、`evidence-map.md`、`claim-ledger.md`、`comparison-matrix.md` 和 `open-questions.md` 共同定义。

## 文章中心论点

Agent Memory 不是一个“选哪种数据库”的问题，而是一套长期状态的权力与生命周期设计：谁能把什么写成记忆，旧事实怎样失效，证据如何保留，哪些内容怎样进入上下文。

四个系统当前分别代表：

1. TencentDB Agent Memory：团队级异构经验资产控制面。
2. Mem0：ADD-only 抽取与混合检索的紧凑记忆记录服务。
3. Graphiti：保留 episode provenance 和事实有效期的动态上下文图。
4. Letta：从 legacy memory blocks 转向 Agent 自主管理的 Git-backed MemFS。

## 重要的新研究结论

- Mem0 OSS v3 当前自动 `add()` 主路径为单次 LLM、ADD-only；显式 update/delete 仍存在，但不再是自动写入的隐式动作。
- Mem0 Platform decay 不能写成 OSS 能力；OSS 只在当前证据中支持 expiration 等边界。
- Graphiti 将 valid/invalid/expired/reference time 和 episode IDs 放入 fact edge，并用矛盾失效保留历史。
- Letta Agent SDK v0.7.1 已将 block/persona/human 配置标为 deprecated，默认开启 MemFS；对应 Letta Code 版本固定为 v0.30.14。
- TencentDB 原报告的关键源码 blob 在当前默认分支仍未变化；Proxy handler 发生过变化，fail-open 行为已按当前 commit 重新核对。

## 固定源码状态

| Project | Exact state |
|---|---|
| TencentDB | `97f94654280b2932c35ba4806a491999ed244cc9` |
| Mem0 | `001c235229be8795e3834520467bd0d661ed8f34` |
| Graphiti | `10374d6044f91b9ecae3586828abb1ecbf022c4f` |
| Letta Agent SDK | `072b8bf07dac806c1f5e15118ed0e483fb2f7ecc` / release v0.7.1 |
| Letta Code | `a75f4d93ef1c61946c7f3e4dec2b3ecf17c17680` / tag v0.30.14 |
| Letta Docs | `9a8305b954ffac89db8cf325693f928fba8f3bb7` |

## 已否决与已取代文件

旧 `article-outline.md`、`visual-plan.md` 以及第一版 Coding Agent runtime 研究只能作为历史背景。当前正式产物使用 `outline.md`、`visual-brief.md` 和重写后的 `article.md`。Claude Code、Codex、Gemini CLI、OpenCode、DSH、OpenClaw、Hermes 不再是本文主体。

## 下一步编辑决策

1. 用户确认中心论点和四项目篇幅是否合适。
2. 决定是否补一个真实业务案例或统一实验，当前质量与成本排序仍为 OPEN。
3. 根据 `visual-brief.md` 制作关系图，不在研究阶段生成。
4. 文章确认后把 front matter 的 `status` 从 `draft` 改为 `approved`，再进入社交平台改写或博客发布。

## 验证命令

~~~powershell
python -X utf8 C:\Users\Lenovo\.codex\skills\research-open-source-project\scripts\validate_research_artifacts.py D:\4evour_blog\research\agent-runtime-memory-2026 --mode research
python -X utf8 C:\Users\Lenovo\.codex\skills\research-open-source-project\scripts\validate_research_artifacts.py D:\4evour_blog\research\agent-runtime-memory-2026 --mode article
~~~
