import rss from "@astrojs/rss";
import { getPublishedPosts } from "../utils/posts";

export async function GET(context) {
  const posts = await getPublishedPosts();

  return rss({
    title: "4evour blog",
    description: "4evour 的技术、项目和日常思考。",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: "<language>zh-CN</language>",
  });
}
