# Editorial Review

## Structural Edit

- Purpose: 通过“谁有权改写过去”把四个项目放进一个读者问题，而不是按仓库 README 顺序介绍。
- Thesis: 在前两节给出，后文每节都回答记忆单元、写入权、冲突、交付和治理。
- Evidence coverage: 四项目均有至少两条源码事实，且对 Mem0 OSS/Platform、Graphiti/Zep、Letta legacy/current 做了边界区分。
- Counterargument: 已说明简单 API 和组合方案为何仍需要明确默认生命周期。
- Reader payoff: 第 8 节把系统差异转成场景选型和 ownership matrix，而不是结尾泛泛总结。

## Language Edit

- 统一使用“记忆单元、写入者、冲突、有效时间、交付、权威来源”等术语。
- “最强、领先、最新、爆火”只在有可复核范围时使用；本文不做热度判断。
- FACT 用源码或官方文档直述，INFERENCE 用“我的阅读是/这意味着”，OPEN 用“本文尚未证明”。
- 文章不把 `system/` 常驻误写成全部 MemFS 文件常驻，也不把 Platform decay 误写成 OSS 能力。

## Remaining Risks

- Mem0 当前源码仍保留旧四操作 prompt，读者可能在链接后看到与主路径不同的历史文本；正文需明确运行路径与迁移残留。
- TencentDB 的 Proxy 在当前 commit 发生过改动，文章只写重新核对过的 fail-open 行为，不延用旧版行号。
- “四者代表四种记忆观”是综合判断，不是项目官方自我分类；正文需保持推断语气。
- 质量和成本排序仍是 OPEN，不能用项目 README benchmark 填空。

## Status

文章已完成结构与事实边界初稿，待用户确认是否保留四项目全篇、是否加入真实案例和是否发布到博客页面后再进入 `approved`。
