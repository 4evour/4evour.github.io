# Article Purpose

## Why This Article

Agent Memory 正在从“把历史对话塞进向量数据库”转向更难的问题：什么值得长期保存，谁可以修改它，旧事实何时失效，来源如何保留，哪些内容应该进入每轮上下文。2026 年 8 月的四个代表性实现仍在快速变化：Mem0 的 OSS 写入路径已经转为 ADD-only，Letta SDK 将 memory block 标成 legacy 并默认转向 Git-backed MemFS，Graphiti 持续强化时间事实和混合检索，TencentDB 则把 Chat Memory、Skill、Wiki、CodeGraph 放入团队资产控制面。旧的“记忆组件功能表”已经无法解释这些变化。

## Target Reader

正在做 Agent、RAG、Copilot 或多 Agent 系统的工程师、架构师和技术负责人。读者知道 embedding、向量检索、工具调用和上下文窗口，但不一定已经把记忆当作一致性、权限和生命周期问题来设计。

## Reader Before and After

读者读前可能会问“哪个项目的召回最好”。读完后应该能先回答：

1. 这类记忆的权威写入者是后台抽取器、图谱解析器、Agent 还是团队管理员？
2. 新信息出现时，是追加、覆盖、让旧事实失效，还是提交一个可审计的文件变更？
3. 记忆要以搜索结果、稳定 system context、动态 prefix、工具调用还是 Agent 文件的形式交付？
4. 共享、版本、删除和恢复的边界由谁负责？

## Common Misreading

把四个项目放在同一条“抽取 → 向量化 → 检索 → 注入”流水线上，用功能数量或 benchmark 排名。本文会把它们放在同一组生命周期问题上比较，而不是假设它们解决同一层。

## Non-goals

本文不声称四个系统中存在绝对赢家，不复现项目方 benchmark，不把 Mem0 Platform、Zep Cloud 或 Letta 的旧 block 文档冒充开源主干能力，也不提供一个可以直接复制到生产的统一架构。

## Evidence Base

研究包位于本目录。核心证据固定到 TencentDB `97f9465`、Mem0 `001c235`、Graphiti `10374d6`、Letta Agent SDK `072b8bf`、Letta Code `v0.30.14` 对应 `a75f4d9` 和 Letta Docs mirror `9a8305b`。本轮没有安装依赖或执行完整系统，因此涉及质量、吞吐和成本的判断都保留边界。
