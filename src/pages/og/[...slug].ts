import { OGImageRoute } from "astro-og-canvas";
import { getCollection } from "astro:content";

const posts = await getCollection("blog", ({ data }) => !data.draft);

const pages = Object.fromEntries(
  posts.map((post) => [
    post.id,
    { title: post.data.title, description: post.data.description },
  ]),
);

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  param: "slug",
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[247, 244, 239]],
    border: { color: [11, 107, 94], width: 6, side: "block-end" },
    padding: 80,
    font: {
      title: {
        color: [29, 27, 24],
        families: ["Inter"],
        size: 64,
        weight: "Bold",
        lineHeight: 1.2,
      },
      description: {
        color: [100, 96, 88],
        families: ["Inter"],
        size: 32,
        weight: "Normal",
        lineHeight: 1.4,
      },
    },
    fonts: ["./public/fonts/Inter-Bold.ttf"],
  }),
});
