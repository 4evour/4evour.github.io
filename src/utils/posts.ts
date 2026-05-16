import { getCollection } from "astro:content";

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
