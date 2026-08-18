# Outline

## 1. 先问“谁有权改写过去”
用一个事实变化的例子引出：追加、覆盖、失效和提交文件是四种不同的长期状态语义。给出中心判断。

## 2. 四套系统不是四个向量库
建立统一坐标：记忆单元、写入者、冲突/时间、检索/交付、共享/治理、成本。先给总表，避免后文退化成功能罗列。

## 3. TencentDB：把经验变成团队可装配资产
解释四类资产、L0-L3、稳定/动态上下文、Skill 版本、Knowledge 工具、ACL 与 Binding；随后写异步、多服务和缺少统一事实时间模型的代价。

## 4. Mem0：把事实变成可检索、可追加的记录
解释 v3 ADD-only 路径、hash/entity linking、semantic+BM25+entity 检索、显式 CRUD 和 OSS/Platform 遗忘边界；把“减少自动破坏”与“冲突积累”并置。

## 5. Graphiti：把变化中的真相变成带时间和来源的图
从 episode 进入、实体/edge 解析、valid/invalid/expired、矛盾失效和 provenance 讲到多路搜索与 RRF；并说明图数据库、顺序 ingest 和 LLM 成本。

## 6. Letta：让 Agent 自己维护一份版本化记忆仓库
纠正旧 block 叙事，解释 MemFS 的 system/常驻、目录树、按需文件、memory tool commit、dreaming/worktree 和 shared memory；再写自治质量和 Git 争用边界。

## 7. 同一个需求，四种后果
用“偏好或事实发生反转”做横向对照：Mem0 追加后显式清理、Graphiti 让旧 edge 失效、Letta 修改并提交文件、TencentDB 按资产类型与治理路径处理。

## 8. 选型与组合规则
给出四类适用场景、组合时的唯一权威来源原则，以及五个必须在设计评审中回答的问题。

## 9. 结论：没有标准答案，但有标准问题
回到中心判断，列出仍未证明的质量与成本问题。
