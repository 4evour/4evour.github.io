# Astro 迁移与前端重构方案

## 目标

将 `https://4evour.github.io/` 从 Gmeek 默认骨架迁移为 Astro 静态博客，保留个人博客属性，同时增加更自由的首页设计、文章阅读体验、标签归档、暗色模式与 GitHub Pages 自动部署能力。

## 推荐方向

- 技术框架：Astro。
- 内容格式：Markdown 优先，必要时支持 MDX。
- 样式方案：先使用 Astro + CSS 变量 + 少量组件样式；如果后续需要更快构建复杂组件，再引入 Tailwind CSS。
- 部署方式：GitHub Actions 构建 Astro，并发布到 GitHub Pages。
- 视觉参考：
  - Astrofy：适合“个人主页 + 博客 + 项目展示”的整体结构。
  - AstroPaper：适合“干净、耐读、技术博客优先”的文章体验。
  - Nextfolio / Nim：适合作为更现代的动效与个人品牌参考，但不建议直接照搬技术栈。

## 信息架构

### 页面

- 首页 `/`：个人介绍、精选文章、项目入口、社交链接。
- 博客列表 `/blog/`：文章列表、摘要、标签、时间。
- 文章详情 `/blog/[slug]/`：正文、目录、上一篇/下一篇、标签。
- 标签页 `/tags/` 与 `/tags/[tag]/`：按主题归档。
- 关于页 `/about/`：个人背景、技术栈、站点说明。
- 项目页 `/projects/`：展示个人项目或作品。

### 内容模型

每篇文章使用 Markdown frontmatter：

```yaml
---
title: "文章标题"
description: "文章摘要"
pubDate: 2026-05-16
updatedDate: 2026-05-16
tags: ["Astro", "Blog"]
draft: false
---
```

文章文件建议放在 `src/content/blog/`，图片资源放在 `src/assets/` 或 `public/images/`。

## 迁移策略

### 阶段 1：确认源码与内容来源

1. 克隆或连接当前 `4evour.github.io` 对应 GitHub 仓库。
2. 确认 Gmeek 文章来源：
   - 如果文章来自 GitHub Issues：导出 Issues 标题、正文、标签、创建时间。
   - 如果已有 Markdown 文件：直接迁移到 Astro content collection。
3. 记录当前线上 URL 结构，决定是否需要保留旧链接或做重定向。

验收标准：

- 能列出全部现有文章。
- 能确定每篇文章的新 slug。
- 能确认旧链接是否需要兼容。

### 阶段 2：创建 Astro 基础站点

1. 初始化 Astro 项目。
2. 配置 `site` 为 `https://4evour.github.io`。
3. 增加 content collection，定义文章 schema。
4. 建立基础布局：
   - `BaseLayout`
   - `Header`
   - `Footer`
   - `ThemeToggle`
   - `PostList`
   - `PostCard` 或文章列表项

验收标准：

- `npm run dev` 可启动本地预览。
- `npm run build` 可成功生成静态文件。
- 首页、博客列表、文章详情至少有一条示例内容可访问。

### 阶段 3：设计与前端重构

采用“Astrofy 的个人主页结构 + AstroPaper 的文章阅读体验”作为第一版方向：

- 首页首屏突出 `4evour`、一句个人定位、头像或视觉图、社交入口。
- 首页下半部分展示精选文章与项目，不做复杂营销页。
- 文章页优先保证可读性：合适行宽、代码块样式、目录、暗色模式。
- 整体风格建议：浅色背景 + 深色文字 + 一个强调色；暗色模式保持克制。
- 动效只做轻量交互：导航 hover、主题切换、文章列表进入过渡。

验收标准：

- 桌面与移动端首屏不拥挤。
- 文章正文阅读宽度舒适，代码块可横向滚动。
- 标签、时间、摘要在列表页清晰可扫读。

### 阶段 4：内容迁移

1. 将现有文章转换为 Markdown。
2. 为每篇文章补齐 frontmatter。
3. 统一图片引用路径。
4. 检查内部链接、代码块语言、标题层级。
5. 对草稿或不想公开的文章设置 `draft: true`，生产构建过滤。

验收标准：

- 所有公开文章能在 `/blog/` 列表中出现。
- 所有文章详情页构建无报错。
- 图片、代码块、链接显示正常。

### 阶段 5：部署与上线

1. 添加 GitHub Actions workflow。
2. 设置 GitHub Pages source 为 GitHub Actions。
3. 推送主分支触发构建。
4. 验证线上 `https://4evour.github.io/` 页面。

验收标准：

- GitHub Actions 构建成功。
- 线上首页、博客列表、文章详情可访问。
- 浏览器控制台无关键资源 404。

## 推荐任务拆分

### 任务 1：接入当前仓库与文章来源

**描述：** 确认当前 GitHub Pages 仓库和 Gmeek 内容来源，避免迁移时丢文章或破坏旧链接。

**验收标准：**

- 当前仓库已在本地可见。
- 文章来源与导出方式明确。
- 旧 URL 兼容策略明确。

### 任务 2：初始化 Astro 站点骨架

**描述：** 创建 Astro 项目、配置构建脚本、建立基础页面与内容集合。

**验收标准：**

- 本地开发服务器可运行。
- 静态构建成功。
- 示例文章可从列表页进入详情页。

### 任务 3：实现第一版视觉系统

**描述：** 按 Astrofy + AstroPaper 的组合方向实现首页、博客列表和文章页样式。

**验收标准：**

- 响应式布局可用。
- 明暗主题可用。
- 文章阅读体验接近 AstroPaper 的清爽程度。

### 任务 4：迁移真实文章

**描述：** 将 Gmeek 内容转换为 Astro Markdown，并修复图片、链接和 frontmatter。

**验收标准：**

- 文章数量与来源一致。
- 构建无内容 schema 错误。
- 抽查文章显示正常。

### 任务 5：配置 GitHub Pages 部署

**描述：** 使用 GitHub Actions 构建并发布 Astro 静态产物。

**验收标准：**

- push 后自动部署。
- 线上站点访问正常。
- README 或项目文档记录运行与部署命令。

## 风险与处理

| 风险 | 影响 | 处理方式 |
| --- | --- | --- |
| 当前本地目录不是线上仓库 | 无法直接迁移真实内容 | 先克隆或确认 `4evour.github.io` 仓库 |
| Gmeek 内容来自 Issues | 需要额外导出转换 | 使用 GitHub API 或手动导出为 Markdown |
| 旧链接变化 | 搜索引擎或收藏链接失效 | 保留 slug，必要时生成重定向页面 |
| GitHub Pages 路径配置错误 | 静态资源 404 | Astro `site` 与 base 路径按用户页仓库配置 |

## 验证清单

- `npm run dev`：本地预览。
- `npm run build`：生产构建。
- `npm run preview`：预览构建产物。
- 桌面宽度检查：首页、博客列表、文章详情。
- 移动宽度检查：首页首屏、导航、文章正文、代码块。
- 线上检查：主页、至少三篇文章、标签页、暗色模式。

## 当前需要确认的信息

- GitHub 仓库地址是否为 `https://github.com/4evour/4evour.github.io`。
- 现有文章是否来自 Gmeek 的 GitHub Issues。
- 是否要求保留所有旧文章 URL。
