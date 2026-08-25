# Research Handoff

更新时间：2026-08-17

## 当前有效方向

研究主体已经收敛为四个 memory-native 系统：

1. **TencentDB Agent Memory**：主研究对象；重点研究分层记忆如何进一步成为团队级 Memory Asset、ACL、版本与 Agent Loadout 控制面。
2. **Mem0**：原子事实抽取、更新、过滤、检索与个性化记忆服务。
3. **Graphiti**：动态双时态知识图谱、事实失效、episode provenance 与混合检索。
4. **Letta**：stateful agent、always-visible memory blocks 与 Agent 自主管理记忆。

建议文章标题：

> 《Agent Memory 还没有标准答案：TencentDB、Mem0、Graphiti、Letta 的四种记忆观》

中心问题不是“用了什么数据库”，而是四个系统如何分别定义：记忆单元、形成、更新、冲突、时间、检索、注入、共享、治理与遗忘。

## 已否决方向

`article.md`、`article-outline.md`、`evidence-map.md` 和 `claim-ledger.md` 是第一轮 coding-agent runtime 调研。它们可作为“真实 Agent 产品的落地现状”素材，但不能作为新文章主体。

Claude Code、Codex、Gemini CLI、OpenCode、DSH、OpenClaw、Hermes 后续最多保留为一小节现实落差或集成案例。

## 最新源码状态

| Project | Branch | Commit at research | Note |
|---|---|---|---|
| TencentDB Agent Memory | `feat/server_team` | `97f94654280b2932c35ba4806a491999ed244cc9` | 默认分支；v2.0.1 beta，Team Memory / Memory Hub 方向 |
| Mem0 | `main` | `001c235229be8795e3834520467bd0d661ed8f34` | OSS 与 Platform 能力必须分开核对 |
| Graphiti | `main` | `96ef997b265d05222233553bcf86a23e2d1dfd89` | 重点追 `graphiti_core/graphiti.py`、maintenance、search |
| Letta legacy server | `main` | `87fd37aab68c7bdd0d66fe63751553756f6af3e5` | 旧 server 仓库已经归档；应改查 Letta Agent SDK 与官方文档 |

研究日期会影响结论。继续研究前应重新获取 HEAD，并记录从以上 commit 到新 HEAD 的变化。

## 已确认的重要新事实

- TencentDB 当前默认分支不再只是早期的本地 L0-L3 pipeline，而是强调 Chat Memory、Skill、Wiki、CodeGraph 四类资产，以及 Team、Owner、版本、可见性、ACL 和 Agent Binding。
- TencentDB README 明确承认 Wiki/CodeGraph 异步构建、私有仓库接入仍在完善、全自动记忆路由仍在迭代。
- Mem0 近期修正文档里与 SDK 不一致的 decay 说法，因此所有 decay、temporal 和 advanced retrieval 结论必须标注 OSS/Platform 边界。
- Graphiti 近期用 RRF 改进 cross-encoder 前的多路候选融合，并把 episode、source/target node 信息补进事实结果，说明检索公平性和 provenance 仍在演进。
- Letta 的旧开源 server 仓库于 2026-08-16 归档。后续不能用旧 MemGPT/Letta Server 源码代表当前产品。

## 下一步

1. 为四个项目分别建立 exact-commit 源码地图。
2. 各追一条完整链路：输入 → 抽取 → 存储 → 更新/冲突 → 检索 → 交付 → 反馈/遗忘。
3. 严格区分官方 claim、源码事实、项目 benchmark 与独立复现。
4. 重建符合研究模板的 `evidence-map.md`、`thesis.md`、`claim-ledger.md`。
5. 最后重写 `article.md`，不要继续润色第一版。
