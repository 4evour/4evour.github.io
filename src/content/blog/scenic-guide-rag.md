---
title: "我在景区导览项目里怎么做 RAG"
description: "记录灵山胜境智能导览系统里的 RAG 实现：DashScope Embedding、BM25/词面兜底、缓存、知识库上传、真实资料评估集和离线评估报告。"
pubDate: 2026-05-16
tags: ["RAG", "Go", "AI", "知识库"]
project: "灵山胜境智能导览系统"
featured: true
coverTone: "ink"
coverLabel: "RAG"
draft: false
---

这个项目里，RAG 是我花时间最多的一块。

景区导览不能完全依赖大模型自由发挥。游客问“梵宫有什么特色”“灵山大佛多高”“亲子路线怎么走”，答案最好来自景区自己的知识库。否则模型说得再顺，也可能是在编。

所以我做 RAG 时没有只停在“调一个大模型 API”。我更关心几件事：知识怎么导入，向量服务不可用怎么办，中文检索怎么兜底，怎么缓存，怎么评估，管理员怎么维护知识。

这张图是本地真实启动后的管理后台知识库页面，能看到默认知识片段已经通过后端接口进入后台列表，而不是只写在静态文档里。

![灵山智能导览管理后台知识库页面](/images/blog/scenic-guide/admin.png)

## 知识不是硬编码在提示词里

项目里有一个 `knowledge/` 目录，默认放了灵山胜境相关语料：

- `lingshan_corpus.md`
- `lingshan_chunks.jsonl`
- `lingshan_eval_qa.json`
- `lingshan_scale_3000.jsonl`
- `lingshan_eval_300.json`
- `knowledge/real/lingshan_real_chunks.jsonl`
- `knowledge/real/lingshan_real_eval_open.json`
- `lingshan_rag_guide.md`

服务启动时会检查数据库里的知识片段数量。如果为空，就自动从 `lingshan_chunks.jsonl` 导入。这样第一次跑项目时就能问问题，不需要先手动往后台录入一遍知识。当前基础样例是 32 个知识切片和 5 条问答的 smoke test；3000 个切片和 300 条问答是合成闭集验证集，只用于内部回归。最新主口径改为 `knowledge/real/` 下的真实资料评估集：122 个真实资料切片、203 条独立评测问答。

知识片段进入数据库前会做标准化：ID 为空时用 SHA1 派生一个稳定 ID，标题为空时截取正文前 24 个字符，来源为空时默认记成 `admin`，metadata 为空就补空对象。

这些处理不复杂，但很关键。因为后面支持管理员上传 JSONL、JSON、Markdown、TXT。输入格式越开放，服务端越要负责把数据收敛成稳定结构。

## Embedding Provider 和 BM25 兜底

我把向量能力抽成了 `EmbeddingProvider` 接口：

```go
type EmbeddingProvider interface {
    GenerateEmbedding(text string) ([]float64, error)
    Name() string
    IsAvailable() bool
}
```

现在主要有两个实现思路。

配置了 DashScope Embedding API Key 时，用 `text-embedding-v2` 生成 1536 维向量，再用余弦相似度做检索。HTTP client 设置了 30 秒超时和连接复用，避免每次请求都重新建连接。

没有 Embedding Key，或者 provider 不可用时，就退回 BM25/词面本地检索。

我一开始差点只做向量检索，后来觉得这会让项目太脆弱。作品集项目经常要在不同机器上跑，API Key、网络、额度都可能出问题。如果没有本地兜底，RAG 就会变成“配置齐全时才有用”。

## 中文 BM25 怎么做

这个 BM25/词面兜底不是完整搜索引擎，但针对中文问答做了简单处理。

`Tokenize` 会先把文本转小写，然后对 rune 做 2-gram 和 3-gram。这样“灵山大佛”“九龙灌浴”这类中文短语，不需要依赖复杂分词器也能被切出一些可匹配片段。

然后再用正则提取字母、数字、中文词，并过滤一批中文停用词，比如“的”“了”“什么”“怎么”“为什么”等。

打分时我给更长 token 更高权重：

- 长度大于等于 3 的 token 权重更高。
- 2 字 token 次之。
- 最后按文档 token 数做一个 log 归一化，避免长文本天然占优。

这当然比不上成熟搜索引擎，但它解决了一个很实际的问题：没有外部向量服务时，系统依然能回答和景区关键词强相关的问题。

## 检索和缓存

RAG 查询时会先取知识库缓存。知识库缓存 TTL 是 5 分钟，避免每次查询都从数据库全量拉片段。

如果走向量检索，会生成问题向量，再遍历知识片段向量，计算余弦相似度。相似度低于阈值的片段会过滤掉，最后取 TopK。项目里默认 TopK 是 8。

如果走 BM25，就用问题 token 和知识片段 token 计算相关度，同样排序取前几条。

我还加了两类缓存：

- embedding 缓存：同一文本不用重复请求向量。
- query cache：相同问题短时间内可以直接返回回答。

缓存大小上限是 1000。达到上限时简单清空，而不是做复杂淘汰。这个选择有点粗糙，但对当前项目规模够用，也避免为了缓存系统引入过多复杂度。

知识库发生创建、更新、删除、上传时，会主动清掉知识缓存和问答缓存。否则管理员刚改完知识，游客还读到旧答案，这会很尴尬。

## 知识库管理不是摆设

后台知识库接口支持：

- 创建知识片段
- 更新知识片段
- 删除单条知识
- 清空知识库
- 上传 JSONL、JSON、Markdown、TXT
- 分页和关键词过滤列表

Markdown 和 TXT 会按段落切分为大约 1200 字以内的片段。JSON/JSONL 可以直接携带 `title`、`content`、`source`、`metadata`。

清空知识库我做了一个确认参数：必须带 `confirm=DELETE_ALL_KNOWLEDGE`。这个设计很简单，但我觉得应该有。因为清空知识库这种操作，一旦误点，影响的是整个问答系统。

知识库列表后来也从“全表加载后内存分页”改成数据库层分页过滤。这种优化不显眼，但如果知识片段变多，它会直接影响后台可用性。

## 离线评估

我给 RAG 做了一个离线评估命令：

```powershell
go run ./cmd/rag-eval -format text
go run ./cmd/rag-eval -format json
```

这个命令会用 `modernc.org/sqlite` 在内存里起一个临时 SQLite，AutoMigrate 后导入知识库，然后跑 `lingshan_eval_qa.json`、`lingshan_eval_300.json`，或者 `knowledge/real/` 下的真实资料评估集。

评估不是用大模型打分，而是看回答里有没有覆盖预期关键词。报告里会输出：

- 用例总数
- 通过数
- 失败数
- 通过率
- 平均关键词覆盖率
- Recall@K
- MRR@K
- 检索耗时 p50/p95
- 缺失关键词
- 回答预览

现在我不再把 3000/300 合成闭集当成主要卖点。它的 Recall@8 100.0% 只能说明固定合成数据上的检索链路可运行、可回归，不能外推到真实游客开放问法。

更可信的口径是 `knowledge/real/` 真实资料评估：122 个真实资料切片、203 条独立评测问答，并发 16、repeat 3 后一共 609 次 retrieval-only 评估。本地 BM25/词面检索结果为 Recall@8 85.5%、MRR@8 0.749、关键词覆盖率 94.3%、纯检索 p50/p95 约 7ms/10ms。启用 DashScope `text-embedding-v2` 后，同口径 Recall@8 和 MRR 保持一致，检索 p50/p95 约 69ms/80ms。这个指标仍然只覆盖检索链路，不包含 DeepSeek 生成、ASR 或 TTS。

我把这些结果写进了 `docs/rag-eval-report.md`，也在 `knowledge/DATASET.md` 里说明了基础 smoke、合成闭集和真实资料评估集各自能证明什么、不能证明什么。这个边界比一个漂亮的百分比更重要。

这个评估方式不完美，但它有一个优点：稳定、便宜、可自动化。至少我改知识库、改 BM25、改提示词后，可以知道有没有把一些基础问题搞坏。

## 这块最容易踩的坑

RAG 最容易看起来很简单：检索几段文本，塞给模型，返回答案。

真正做起来会遇到一堆工程问题：

- 向量 API 不可用怎么办？
- 默认知识库什么时候导入？
- 管理员上传的 Markdown 怎么切？
- 知识更新后缓存怎么失效？
- 没有 AI Key 时怎么降级？
- 怎么避免日志打印完整用户问题和回答？
- 怎么证明回答没有退化？

我现在这版不敢说多高级，但至少把这些问题都正面处理了一遍。

它最重要的价值，是让 RAG 从“一个调用链”变成了“一个可维护的知识问答模块”：有导入、有检索、有兜底、有缓存、有管理、有评估。
