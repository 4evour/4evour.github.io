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

旧 Gmeek 文章 `test1` 已迁移到 `/blog/test1/`，旧地址 `/post/test1.html` 会跳转到新地址。
