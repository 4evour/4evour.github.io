# Project Overview

## 目标

将个人博客 `https://4evour.github.io/` 从当前 Gmeek 默认骨架迁移为可维护、可定制的 Astro 静态博客，继续部署到 GitHub Pages。

## 当前状态

- 本地目录：`D:\4evour_blog`
- 当前目录已克隆 `https://github.com/4evour/4evour.github.io`。
- 项目已从 Gmeek 迁移为 Astro 静态站点。
- 原 Gmeek 文章 `test1` 已迁移到 `src/content/blog/test1.md`，新地址为 `/blog/test1/`。
- 旧地址 `/post/test1.html` 通过 `public/post/test1.html` 跳转到新地址。

## 拟采用技术栈

- Astro 6：静态站点与博客框架
- Markdown/MDX：博客内容格式
- CSS 或 Tailwind CSS：页面样式
- GitHub Actions：自动构建并部署到 GitHub Pages

## 关键约定

- 后续代码或配置更改前先阅读本文件。
- 仅记录长期有效的项目事实、架构决策、命令和风险。
- 迁移时优先保留既有文章链接或提供重定向，避免旧链接失效。

## 运行与测试方式

- 安装依赖：`npm install`
- 本地开发：`npm run dev`
- 生产构建：`npm run build`
- 构建预览：`npm run preview`
- 迁移计划见 `ASTRO_MIGRATION_PLAN.md`。

## 已知风险

- GitHub Pages 仓库设置需要使用 GitHub Actions 作为 Pages source。
- 后续新增文章时，若需要兼容 Gmeek 旧 URL，应在 `public/post/` 下添加对应跳转页，或保留一致的 slug 策略。
- 当前视觉内容仍是第一版占位文案，后续需要补充真实个人介绍、项目和文章内容。
- `npm audit --audit-level=high` 无 high/critical；当前仅剩 `@astrojs/check` 依赖链里的 `yaml` moderate 审计提示。
