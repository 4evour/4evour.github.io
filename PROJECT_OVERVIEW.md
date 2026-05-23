# Project Overview

## 目标

将个人博客 `https://4evour.github.io/` 从当前 Gmeek 默认骨架迁移为可维护、可定制的 Astro 静态博客，继续部署到 GitHub Pages。

## 当前状态

- 本地目录：`D:\4evour_blog`
- 当前目录已克隆 `https://github.com/4evour/4evour.github.io`。
- 项目已从 Gmeek 迁移为 Astro 静态站点。
- 原 Gmeek 示例文章 `test1` 已从站内删除，不再生成 `/blog/test1/` 和 `/post/test1.html`。
- 已根据 `D:\go web 01` 的“灵山胜境景区智能导览系统”项目生成 3 篇项目复盘文章，覆盖整体架构、RAG 知识库和 Live2D 数字人集成，并归档到 `/projects/scenic-guide/` 项目页。
- 灵山胜境项目页和相关文章已加入真实本地运行截图与演示视频，图片位于 `public/images/blog/scenic-guide/`，视频位于 `public/videos/lingshan-demo-subtitled.mp4`；内容覆盖游客端首页、数据大屏、游客地图、管理后台、Live2D 数字人舞台、真实资料 RAG 评估集、Docker Compose 复现路径和数字人联调检查口径。
- 已根据 `D:\Tour Pass` 生成 3 篇项目复盘文章，覆盖 C++ 行程规划服务整体架构、算法链路和工程化演示，并归档到 `/projects/tour-pass/` 项目页。
- Tour Pass 文章已同步项目 v1.9 运行时能力：请求 ID/耗时/安全头、显式线程池、热点缓存、`/trip/jobs` 异步规划任务、`/metrics` 指标和并发性能基线。
- Tour Pass 内容已同步到项目 v2.8：新增 `/blog/tour-pass-real-data-demo/`，更新原架构/算法/工程化三篇文章的 `updatedDate` 与内容，覆盖高德真实 POI 流水线、`500 POI / 1937 edges` 本地结果、估算边重试后 `98.5%` 高德来源比例、SQLite 复盘、距离缓存、Docker/部署口径和录屏证据链。
- Tour Pass 项目页已加入真实数据证据摘要和站内 Web 演示视频；视频资源位于 `public/videos/tour-pass/tour-pass-web-demo.mp4`，封面位于 `public/videos/tour-pass/tour-pass-web-demo-poster.jpg`，正文和项目页通过站内绝对路径嵌入。
- 已将 CSDN 旧文“2024 昆明邀请赛 VP 记录”迁移为算法文章 `/blog/kunming-2024-vp/`，并归入 `算法`、`ICPC`、`VP`、`C++` 标签。

## 拟采用技术栈

- Astro 6：静态站点与博客框架
- Markdown/MDX：博客内容格式
- CSS：页面样式
- Pagefind：构建后生成静态全文搜索索引
- astro-icon + Lucide：站内导航与操作图标
- astro-expressive-code：Markdown 代码块高亮与展示增强
- @astrojs/rss / @astrojs/sitemap：订阅源与站点地图
- GitHub Actions：自动构建并部署到 GitHub Pages
- 全站默认壁纸使用本地静态资源 `public/images/yukino-wallpaper.png`，由 `src/styles/global.css` 的 `--wallpaper-image` 和主题遮罩变量控制。
- 首页与文章列表使用内容驱动的封面色块；文章 frontmatter 可通过 `featured`、`coverTone`、`coverLabel` 控制展示。
- 算法文章仍使用通用 blog collection；“算法板块”通过 `算法` 标签页聚合，当前不维护独立分类 collection。
- 全站动效使用原生 CSS + 少量内联脚本实现，包括页面进入、滚动出现、首屏视觉轻浮动和 hover 反馈，并尊重 `prefers-reduced-motion`。
- 首页写作日历由已发布文章的 `pubDate` 自动生成，默认展示最新文章所在月份并高亮有文章的日期。
- 首页每日诗词模块由 `src/components/DailyPoem.astro` 提供，内置公版古诗词条目，并在浏览器端按本地日期稳定轮换，无需每日重新构建。
- 桌面端启用自定义鼠标样式：核心光点 + `4e`、`Go`、`RAG`、`AI`、`Live2D` 技术字符拖尾；触屏设备和减少动态设置下自动关闭。
- 全站启用 Astro `ClientRouter` 页面转场；基础布局脚本使用可重复初始化方式，并在 `astro:before-swap` 将当前主题同步到新文档，保障主题切换、滚动出现和自定义鼠标在转场后继续工作。
- 首页使用 `TypedTerminal.astro` 的本地脚本展示循环终端打字机；项目详情页使用 `TechForceGraph.astro` + D3 force/drag/selection 展示带扫描光和拖拽提示的技术星图。两者均尊重 `prefers-reduced-motion`，并限制动画/模拟密度。关于页曾尝试物理标签墙，因视觉效果不佳已移除。
- 项目页当前包含两个项目归档：“灵山胜境智能导览系统”和 “Tour Pass”；项目文章通过 frontmatter 的 `project` 字段聚合到对应归档页。
- 关于页已从占位内容升级为正式个人介绍入口，覆盖技术方向、站内项目导览、GitHub 与 RSS 入口。

## 关键约定

- 后续代码或配置更改前先阅读本文件。
- 仅记录长期有效的项目事实、架构决策、命令和风险。
- 迁移时优先保留既有文章链接或提供重定向，避免旧链接失效。
- 视觉升级优先保持静态、轻量、可维护；封面视觉由 CSS 与文章元数据生成，站点背景优先使用本地静态素材，避免不可控远程素材。
- 从外站迁移文章图片时优先落到 `public/images/blog/<slug>/`，正文使用站内绝对路径引用，避免依赖远程防盗链和外部资源稳定性。
- 站内演示视频放在 `public/videos/<project>/`，正文或项目页使用 HTML `<video>` 嵌入；视频应提供同目录 poster，并在 `src/styles/global.css` 复用文章媒体样式。

## 运行与测试方式

- 安装依赖：`npm install`
- 本地开发：`npm run dev`
- 生产构建：`npm run build`（包含 `astro check`、`astro build` 和 `pagefind --site dist`）
- 构建预览：`npm run preview`
- 搜索索引位于 `dist/pagefind/`，仅在生产构建后生成；开发模式下搜索页会降级提示。
- 迁移计划见 `ASTRO_MIGRATION_PLAN.md`。

## 已知风险

- GitHub Pages 仓库设置需要使用 GitHub Actions 作为 Pages source。
- 后续新增文章时，若需要兼容 Gmeek 旧 URL，应在 `public/post/` 下添加对应跳转页，或保留一致的 slug 策略。
- 当前视觉内容仍是第一版占位文案，后续需要补充真实个人介绍、项目和文章内容。
- 默认壁纸包含第三方动漫角色素材，仅适合个人非商业展示；若站点转向商业、公开作品集或需要严格授权，应替换为自有或明确授权素材。
- `npm audit --audit-level=high` 无 high/critical；当前仅剩 `@astrojs/check` 依赖链里的 `yaml` moderate 审计提示。
- 本地若已有旧的 `astro dev`/`astro preview` 占用 4321 端口，预览最新 `dist` 时应换用空闲端口，例如 `npm run preview -- --host 127.0.0.1 --port 4399`。
