import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://4evour.github.io",
  integrations: [
    expressiveCode({
      themes: ["github-light", "github-dark"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      defaultProps: {
        frame: "code",
      },
    }),
    icon({
      include: {
        lucide: [
          "arrow-left",
          "arrow-right",
          "arrow-up",
          "arrow-up-right",
          "chevron-down",
          "message-square",
          "moon",
          "rss",
          "search",
          "search-x",
          "sun",
          "tags",
          "x",
        ],
      },
    }),
    sitemap(),
  ],
});
