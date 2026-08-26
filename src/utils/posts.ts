import { getCollection } from "astro:content";

export const categoryDefinitions = [
  { id: "project", label: "项目" },
  { id: "tech", label: "技术" },
  { id: "algorithm", label: "算法" },
  { id: "misc", label: "杂谈" },
] as const;

export const categoryLabels = Object.fromEntries(
  categoryDefinitions.map(({ id, label }) => [id, label]),
) as Record<(typeof categoryDefinitions)[number]["id"], string>;

export async function getPublishedPosts() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function getReadingMinutes(body = "") {
  const plainText = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/<[^>]+>/g, " ");
  const cjkCharacters = plainText.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latinWords = plainText.match(/[A-Za-z0-9][A-Za-z0-9_+-]*/g)?.length ?? 0;

  return Math.max(1, Math.ceil(cjkCharacters / 400 + latinWords / 220));
}

export function getAllTags(
  posts: Awaited<ReturnType<typeof getPublishedPosts>>,
) {
  return Array.from(new Set(posts.flatMap((post) => post.data.tags))).sort(
    (a, b) => a.localeCompare(b),
  );
}

export function getPostsByProject(
  posts: Awaited<ReturnType<typeof getPublishedPosts>>,
  project: string,
) {
  return posts.filter((post) => post.data.project === project);
}

export function getSeriesPosts(
  posts: Awaited<ReturnType<typeof getPublishedPosts>>,
  project: string,
) {
  return posts
    .filter((post) => post.data.project === project)
    .sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());
}
