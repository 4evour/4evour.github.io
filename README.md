# 4evour blog

个人博客站点，基于 [Astro](https://astro.build/) 构建并部署到 GitHub Pages。

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 写文章

文章放在 `src/content/blog/`。每篇文章使用 Markdown frontmatter：

```yaml
---
title: "文章标题"
description: "文章摘要"
pubDate: 2026-05-16
tags: ["Tag"]
draft: false
---
```

原 Gmeek 示例文章 `test1` 已从站内删除。后续从外站迁移文章时，优先将图片放到 `public/images/blog/<slug>/`，正文使用站内绝对路径引用。

## 后台编辑

站点提供 Git-based CMS 后台：`/admin/`。

- 后台会直接编辑 `src/content/blog/` 下的 Markdown 文章。
- 图片默认上传到 `public/images/blog/uploads/`，正文中使用 `/images/blog/uploads/...` 引用。
- 保存文章会向 `4evour/4evour.github.io` 的 `main` 分支提交变更，现有 GitHub Pages workflow 会自动构建部署。
- 只有拥有该 GitHub 仓库写权限并完成授权的人才能保存内容；公开访问 `/admin/` 页面本身不等于拥有编辑权限。
- 新文章默认是草稿，确认无误后把 `draft` 改为 `false` 再发布。
