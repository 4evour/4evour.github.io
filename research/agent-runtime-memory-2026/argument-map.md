# Argument Map

## Central Claim

Agent Memory 的核心不是选择向量库，而是选择长期状态的权力与生命周期模型。四个项目分别把“团队资产治理、紧凑记忆记录、时间化事实图、Agent 自治状态”放在中心，因此应该按应用的真相来源、冲突、交付和治理要求选型。

## Existing Belief

记忆系统通常被理解成一个负责抽取事实、存储 embedding、搜索 top-k 并交给 prompt 的 RAG 组件。这个模型适合解释最小 API，却解释不了自动覆盖、历史失效、团队共享、Git 版本和上下文常驻之间的行为差异。

## Claim Hierarchy

| ID | Claim | Type | Evidence IDs | Section Job |
|---|---|---|---|---|
| A-001 | 长期记忆首先是状态权力和生命周期问题 | INFERENCE | C-001, X-001 | 开篇洞察 |
| A-002 | TencentDB 把异构经验统一为可治理资产 | INFERENCE | T-001~T-007 | 解释团队控制面 |
| A-003 | Mem0 当前 OSS 主路径优先保证追加式事实沉淀 | INFERENCE | M-001~M-006 | 解释保守写入与清理成本 |
| A-004 | Graphiti 把事实时间、矛盾失效和来源 episode 放在一等位置 | INFERENCE | G-001~G-006 | 解释动态知识图 |
| A-005 | Letta 把记忆维护变成 Agent 可执行的 Git 工作流 | INFERENCE | L-001~L-007 | 解释自治状态 |
| A-006 | 选型应按真相来源和治理边界，而不是功能 checkbox | OPINION | X-003 | 给出决策建议 |
| A-007 | 统一 benchmark 下的质量和成本排序仍未知 | OPEN | C-004, X-004 | 保留研究边界 |

## Causal Chain

```text
记忆单元不同
  -> 写入者和冲突规则不同
  -> 时间、版本和来源语义不同
  -> 检索结果的形状与上下文位置不同
  -> 共享、运维和失败模式不同
  -> 必须先按长期状态的权威边界选型
```

## Counterargument and Reply

反论点：应用只需要 `add()` 与 `search()`，复杂生命周期可以以后补。回应：默认值已经在决定生命周期；Mem0 ADD-only、Graphiti invalidation、Letta commit 和 TencentDB binding 都会把未来迁移成本提前写进系统。复杂度可以推迟，但不能消失。

## Unproven

四者在统一数据集、模型和 token 预算下的召回质量、错误写入率、P95、存储写放大和人工维护成本仍未有本文独立结果。
