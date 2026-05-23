---
title: "Tour Pass 的真实数据流水线和演示视频"
description: "记录 Tour Pass v2.8 如何补上真实 POI 采集、通勤边来源门禁、Docker 容器冒烟、部署口径、SQLite 复盘和站内演示视频。"
pubDate: 2026-05-23
tags: ["C++", "工程化", "真实数据", "项目复盘"]
project: "Tour Pass"
featured: true
coverTone: "violet"
coverLabel: "Demo"
draft: false
---

这次更新 Tour Pass，我主要补的不是一个更花的页面，而是一组“别人可以相信这个项目”的证据。

最早的 Tour Pass 用 `25 POI / 46 edges` 的长沙样例数据就能跑通：行程规划、候选对比、路径查询、BM25 检索、时间窗复核和 LLM/模板解释都在本地闭环。但如果把它放进作品集，只说“我有一个样例图”还是偏薄。面试里很自然会继续问：真实地点怎么进来？通勤边是不是地图路网？数据大一点会不会爆？服务能不能容器化？演示视频能不能不用我本地编译？

所以 v2.8 的重点是把这些问题拆开回答。

<video controls preload="metadata" poster="/videos/tour-pass/tour-pass-web-demo-poster.jpg" aria-label="Tour Pass Web 演示视频">
  <source src="/videos/tour-pass/tour-pass-web-demo.mp4" type="video/mp4" />
  你的浏览器不支持 HTML5 视频播放，可以直接访问 /videos/tour-pass/tour-pass-web-demo.mp4。
</video>

## 真实 POI 和真实路网不是一回事

Tour Pass 现在有一条高德 Web 服务采集流水线：

```powershell
$env:AMAP_API_KEY="your-amap-web-service-key"
node scripts/fetch_amap_pois.js --config config/amap.changsha.json --out-dir output/amap-changsha --min-pois 200
node scripts/build_commute_edges.js --pois output/amap-changsha/pois.json --out-dir output/amap-changsha --neighbors 6 --fallback fail --min-amap-ratio 0.8 --mode mixed --batch-size 100
node scripts/validate_data.js --pois output/amap-changsha/pois.json --edges output/amap-changsha/edges.json --min-pois 200 --require-edge-source
```

第一步把长沙真实 POI 拉下来，做去重、类型归一、区域统计和字段标准化。第二步为近邻 POI 生成通勤边，优先使用高德距离/路径结果；如果失败，可以选择直接失败，也可以在开发口径下退回地理估算。第三步做数据门禁，检查 POI 字段、边引用、图连通性、类型覆盖和边来源。

我特意让边数据保留 `source`：

```json
{
  "source": "amap",
  "provider": "amap",
  "mode": "driving",
  "duration_seconds": 612,
  "amap_status": "ok"
}
```

或者：

```json
{ "source": "geo_estimated" }
```

这个字段看起来像小细节，但它决定了表达边界。真实 POI 只能说明地点来自真实地图数据；只有通勤边也有足够高的 `amap` 来源比例，才更接近真实路网。只要还有 `geo_estimated`，就必须披露，不能把它包装成实时交通能力。

## 当前本机真实数据结果

2026-05-22 本机跑通过一次 `500` 个长沙 POI 的真实采集，结果记录在 Tour Pass 仓库的 `docs/real_data_report.md` 和 `docs/real_data_retry_report.md`。

采集摘要是：

| 指标 | 结果 |
| --- | ---: |
| POI | 500 |
| 通勤边 | 1937 |
| 区域覆盖 | 9 个区县/区域 |
| 类型分布 | attraction=240, restaurant=160, hotel=65, nightlife=35 |
| 初始高德边比例 | 88.1% |
| 重试后高德边比例 | 98.5% |
| 重试后估算边 | 29 |

第一次生成边时有 `231` 条 `geo_estimated`。后来用：

```powershell
node scripts/retry_geo_edges.js --pois output/amap-changsha/pois.json --edges output/amap-changsha/edges.json --out-dir output/amap-changsha-retry --mode driving --min-amap-ratio 0.7
```

重试这些估算边，其中 `202` 条转成了高德来源，最终剩下 `29` 条估算边。这个结果支撑的说法是：当前本地数据集大部分通勤耗时来自高德，而不是手写估算；但它仍然不是实时路况，也不是生产级地图路由。

## 一键真实数据流程

为了减少“文档里命令很多，但实际要手动拼”的问题，项目新增了：

```powershell
node scripts/run_real_data_pipeline.js --config config/amap.changsha.json --out-dir output/amap-changsha --min-pois 500 --neighbors 6 --fallback geo_estimated --min-amap-ratio 0.7 --mode driving --sizes 100,200,500 --iterations 5
```

它会串起 POI 采集、通勤边生成、数据校验和真实规模实验，并输出聚合报告。正式写报告时可以切到更严格的门禁：

```powershell
node scripts/run_real_data_pipeline.js --strict-edges --min-pois 200 --sizes 100,200
```

严格模式的意义不是让演示更麻烦，而是让低质量数据停在入口。如果边来源比例不够，就宁可失败，也不要把估算结果混进“真实数据能力”的描述里。

## 规模实验和算法质量

真实规模实验记录的是本地算法热路径趋势，不包含远程 LLM，也不代表生产 SLA。

当前报告里的 100/200/500 POI 结果是：

| POI | Edges | 高德边比例 | 缓存模式 | 启动耗时 | p95 |
| ---: | ---: | ---: | --- | ---: | ---: |
| 100 | 106 | 85.8% | all_pairs | 0 ms | 6.5 ms |
| 200 | 391 | 87.0% | all_pairs | 18 ms | 6.3 ms |
| 500 | 1937 | 88.1% | all_pairs | 339 ms | 128.9 ms |

500 POI 的 p95 明显上升，这个数字不漂亮，但它很有用。它告诉我：当真实 POI 数量扩大后，候选召回、Beam Search 参数、时间窗过滤和最短路缓存策略还有继续优化空间。

算法质量报告则用 10 个候选 POI 子集做精确枚举基线，并补充贪心 baseline。它不是为了证明 Beam Search 全局最优，而是为了说明这个近似策略在小规模对照下大致接近目标，同时仍可能牺牲通勤分钟数。这个边界比一句“算法效果很好”更可信。

## Docker 和部署口径

Tour Pass 现在可以构建 Docker 镜像：

```powershell
docker build -t tour-pass:local .
docker run --rm -p 8080:8080 -e LLM_DISABLED=1 tour-pass:local
node scripts/container_smoke.js http://127.0.0.1:8080
```

容器默认监听 `0.0.0.0:8080`，并设置 `LLM_DISABLED=1`。这两个默认值都服务于演示稳定性：宿主机能通过端口映射访问，公开视频也不会依赖远程模型密钥。

部署文档里预留了 GHCR、Render、Fly 和 Railway 这类 Docker Web Service 口径，也写清楚了 SQLite 的边界。SQLite 用于规划请求、异步任务、benchmark 和数据版本复盘，不在规划热路径里承担高并发数据库角色。如果平台没有持久卷，SQLite 历史会随容器重启丢失，但核心规划仍能跑。

这里最重要的是不越界表达。Docker 镜像证明“服务可构建、可启动、可冒烟”，不证明 `cpp-httplib` 是生产网关，也不证明项目已有生产 SLA。

## 演示视频讲什么

这次放到博客里的演示视频走 Web 演示台路径，而不是录一堆终端命令。

我希望观众能在几分钟内看到：

1. 加载示例偏好，生成 5 个候选方案。
2. 在规划概览里看候选卡片、KPI 和服务指标。
3. 在候选对比里看策略差异、多样性指标和 Pareto 分层。
4. 在路线明细里看时间轴、时间窗复核和站点评分拆解。
5. 在算法解释里看 Beam Search 保留状态、Pareto debug 和 BM25 排序贡献。
6. 在工具箱里看路径查询、POI 搜索、替换方案和模板解释。

这样展示的重点不是“页面有多炫”，而是把 Tour Pass 的核心价值压缩成一条能被浏览器理解的证据链：数据可以进来，算法可以解释，候选可以比较，服务可以观察，离线也可以演示。

## 我对这一版的判断

Tour Pass v2.8 仍然不是生产级旅行平台。

它没有实时交通，没有用户画像学习，没有线上 SLA，也没有真实业务流量。但它已经比一个普通算法 demo 更完整：有可离线演示的小样例，有真实 POI 接入入口，有边来源门禁，有本地规模实验，有算法质量对照，有 Docker 冒烟，有部署边界说明，还有一段可以直接嵌到博客里的演示视频。

这正是我想要的作品集状态：不把项目吹成它不是的东西，但把已经完成的工程证据讲清楚。
