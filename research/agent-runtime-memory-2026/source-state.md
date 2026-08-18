# Source State

- Commit: multi-project; exact commits listed in the Repositories table below
- Research date: 2026-08-18
- Requested audience: 已了解 LLM、RAG 与 Agent 基本概念，正在设计长期运行 Agent 的中文技术读者
- Research question: 四个系统如何定义记忆单元、写入权、更新与冲突、时间、检索、上下文交付、共享、治理和遗忘？
- Explicit non-goals: 不做 stars/热度排名，不复述 README 功能清单，不把托管平台能力写成开源能力，不证明未复现的 benchmark 与生产性能
- Runtime work performed: 静态源码、测试与官方文档分析；未部署四套完整系统，未复现 benchmark

## Repositories

| System | Repository / source | Branch or release | Exact commit | Source role |
|---|---|---|---|---|
| TencentDB Agent Memory | https://github.com/TencentCloud/TencentDB-Agent-Memory | `feat/server_team` | `97f94654280b2932c35ba4806a491999ed244cc9` | 当前默认分支；核心代码证据 |
| Mem0 OSS | https://github.com/mem0ai/mem0 | `main` | `001c235229be8795e3834520467bd0d661ed8f34` | OSS v3 写入、检索与 CRUD 证据 |
| Graphiti | https://github.com/getzep/graphiti | `main` | `10374d6044f91b9ecae3586828abb1ecbf022c4f` | 时序图构建、冲突和检索证据 |
| Letta Agent SDK | https://github.com/letta-ai/letta-agent-sdk | release `v0.7.1` / `main` | `072b8bf07dac806c1f5e15118ed0e483fb2f7ecc` | 当前 SDK 公共接口；依赖 `@letta-ai/letta-code 0.30.14` |
| Letta Code | https://github.com/letta-ai/letta-code | tag `v0.30.14` | `a75f4d93ef1c61946c7f3e4dec2b3ecf17c17680` | SDK 发布版对应的 MemFS 实现 |
| Letta Docs mirror | https://github.com/letta-ai/letta-docs-md | `main` | `9a8305b954ffac89db8cf325693f928fba8f3bb7` | 当前 MemFS、stateful agent、shared memory 官方语义 |

## TencentDB Version Check

原始深度报告基于 `fe3230f176f1bf5832fee79d12494bbc2d19a8aa`。本轮重新核对当前默认分支：资产类型、权限检查、自动召回、Skill 版本、Pipeline Manager、Knowledge 工具白名单和 per-asset 构建队列的 blob SHA 均未变化；`MemoryProxy/src/handler.ts` 已变化，因此 fail-open 与异步写回结论按当前文件重新检查。当前分支较原报告多 9 个提交，主要包含 v2.0.1 beta 发布、Panel/Proxy 集成和文档更新。

## Official Docs Inspected

- TencentDB: `README_CN.md`、`ROADMAP_CN.md` 及仓库内模块文档
- Mem0: Add/Search/Update/Delete、Memory Types、OSS reranker、Platform decay/expiration 文档
- Graphiti: README、源码 docstring、测试和 Zep/Graphiti 边界说明
- Letta: Stateful Agents、MemFS、Agent SDK Memory、Memory & Dreaming、Shared Memory 与 SDK Repositories

## Evidence Boundary

本文能比较公开实现中的数据模型、写入与检索链路、版本/时间/权限语义和明显的工程成本。本文不能证明真实召回质量、生产 P95、跨租户隔离、LLM 抽取准确率、Git 冲突率或项目方 benchmark 的可复现性。
