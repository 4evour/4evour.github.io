# Source State

- Research date: 2026-08-17
- Topic: 热门 Agent 运行时的系统记忆设计
- Prior baseline: `D:/TencentDB-Agent-Memory/report/agent-memory/research-v3/article.md`
- Mode: reviewed research; this phase produces evidence and thesis before article prose
- Evidence boundary: 只研究公开文档、公开仓库与可验证代码；不推断闭源服务端实现

## Runtime samples

| Project | Repository | Branch | Commit | Stars at access | Initial reason |
|---|---|---|---|---:|---|
| Claude Code | `anthropics/claude-code` | `main` | `ae58f7a0a23f0fddedd668de74622ff46646526b` | 141746 | 分层 CLAUDE.md 与 Auto Memory |
| Codex | `openai/codex` | `main` | `21cfd369efca2df70c904c580b2e7e2e3eddb3c3` | 106455 | 分层 AGENTS.md、会话与 compaction；公开 Agent loop |
| Gemini CLI | `google-gemini/gemini-cli` | `main` | `9a15c45fbfc9f36a9817e0113dbd4fc1138840f0` | 106539 | GEMINI.md 分层文件记忆 |
| OpenCode | `anomalyco/opencode` | `dev` | `2cba7e227d68a7e7e4a2aa9c85b808e8ecb14daf` | 198369 | 事件化 session 与持久 compaction |
| DeepSeek Harness | `deepseek-ai/deepseek-harness` | `master` | `99f6f02fecdb7dff40c3fbc9470f5907c29f74ca` | 147163 | 事件溯源 session、JSONL/Zstd、可插拔 memory MCP |
| OpenClaw | `openclaw/openclaw` | `main` | `793669c8f6ddfad07b40009068f532832685b7d6` | 386522 | MEMORY.md、daily notes、搜索与 compaction flush |
| Hermes Agent | `NousResearch/hermes-agent` | `main` | `4323c67dcc6048fc8e311cdff7600d3d6a17807f` | 231847 | 有界核心记忆、会话检索与外部 provider |

Stars are used only to justify current sample popularity, not technical quality.

## Memory infrastructure baseline

The prior TencentDB report already compares TencentDB Agent Memory, Mem0, Graphiti and Letta. LangGraph is added only as a reference for the state/checkpoint versus cross-thread store distinction. This study does not repeat a generic memory-layer comparison.
