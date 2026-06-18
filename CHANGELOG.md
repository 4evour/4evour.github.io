# CHANGELOG

## 2026-06-18 13:44 - 添加文章后台编辑入口

### 变更内容
- src/pages/admin.astro — 新增 Sveltia CMS 后台入口页面，提供 `/admin/` 文章编辑界面，并固定 CDN 脚本版本。
- public/admin/config.yml — 新增 GitHub backend 配置，映射 `src/content/blog` Markdown 文章字段、草稿、精选、封面色调、标签、项目和图片上传目录。
- README.md — 补充后台编辑说明，说明授权、保存、自动部署和草稿发布流程。

### 原因
- 用户希望能像创作者后台一样自由修改网站文章，并且只有本人可以更改，同时保持方便部署和推送。

### 影响范围
- 影响新增的 `/admin/` 后台入口和文章编辑流程。
- 不影响现有博客页面渲染、文章列表逻辑、样式和 GitHub Pages 部署 workflow。

## 2026-06-18 12:48 - 同步两个项目最新文章内容

### 变更内容
- src/content/blog/scenic-guide-june-update.md — 新增景区导览系统 6 月更新文章，补充官方资料知识库、五种 RAG 检索模式、真实流式回答、语音解耦、Cookie/CSRF 鉴权、电子围栏、老年模式、二维码和游客反馈分析。
- src/content/blog/tour-pass-ai-agent-platform.md — 新增 Tour Pass 6 月更新文章，补充 C++ + Python Agent 双引擎、LangGraph 多 Agent、21 城市 15000+ POI、React 行程编辑器、Render 线上演示和 Agent 502 修复。
- src/content/blog/scenic-guide-architecture.md、src/content/blog/scenic-guide-rag.md、src/content/blog/scenic-guide-digital-human.md、src/content/blog/tour-pass-architecture.md、src/content/blog/tour-pass-engineering.md、src/content/blog/tour-pass-real-data-demo.md — 补充 2026-06-18 更新说明，把旧文中的“最新/当前”口径改成历史阶段表述，并指向新增更新文章。
- src/pages/projects/scenic-guide.astro、src/pages/projects/tour-pass.astro、src/pages/projects.astro、src/pages/index.astro、src/pages/about.astro — 更新项目页、项目索引、首页和关于页摘要，让站内入口与两个项目最新仓库口径一致。
- src/pages/og/[...slug].ts — OG 图片生成改用项目已有本地字体，移除构建期 Google Fonts 远程请求。

### 原因
- 用户要求审查博客项目，并根据 GitHub 仓库里已经全面更新的景区导览项目和 Tour Pass 项目补充、更改文章内容。
- 旧文章中有部分“最新/当前”表述已经和 6 月仓库状态冲突，需要保留历史复盘同时避免读者误解为当前项目边界。
- 构建验证连续两次在 OG 图片生成阶段因 Google Fonts TLS 请求失败中断，需要移除构建期网络字体依赖。

### 影响范围
- 影响博客内容展示、项目归档摘要、首页精选项目文案和关于页项目说明。
- 影响文章 OG 图片生成的字体加载方式；不影响 Astro 构建配置、组件逻辑、样式和静态媒体资源。
