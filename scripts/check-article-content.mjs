import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const contentDirectory = path.join(root, "src/content/blog");
const files = (await readdir(contentDirectory)).filter((file) => file.endsWith(".md"));
const errors = [];

for (const file of files) {
  const source = await readFile(path.join(contentDirectory, file), "utf8");
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  let fence = null;
  for (const [index, line] of body.split(/\r?\n/).entries()) {
    const delimiter = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (delimiter) {
      if (!fence) fence = delimiter[1];
      else if (delimiter[1][0] === fence[0] && delimiter[1].length >= fence.length && !delimiter[2].trim()) fence = null;
      continue;
    }
    if (fence) continue;
    if (/^#\s/.test(line)) errors.push(file + ":" + (index + 1) + " 正文重复一级标题；标题应由 frontmatter 提供。");
    if (/原稿 PDF 第|^═{3,}|^【第\s*\d+\s*页】/.test(line)) errors.push(file + ":" + (index + 1) + " 正文残留导出分页，应恢复 Markdown 章节。");
    if (/小红书完整发布稿|^## .*视觉执行方案|^## .*发布前检查/.test(line)) errors.push(file + ":" + (index + 1) + " 正文包含发布工作稿，应使用文章原文。");
  }
  if (fence) errors.push(file + " 代码块未闭合。");
  if (/^\s*!\[[^\]]*发布封面/.test(body)) errors.push(file + " 正文以社交发布封面开头，应使用 Markdown 导语。");
  for (const [, asset] of body.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)\)/g)) {
    const assetPath = path.join(root, "public", decodeURIComponent(asset.split(/[?#]/)[0]));
    try {
      if (!(await stat(assetPath)).isFile()) errors.push(file + " 图片不是文件：" + asset);
    } catch {
      errors.push(file + " 图片缺失：" + asset);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Markdown 内容检查通过：" + files.length + " 篇文章。");
}
