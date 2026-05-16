import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://4evour.github.io",
  integrations: [
    expressiveCode({
      themes: ["github-light", "github-dark"],
      defaultProps: {
        frame: "code",
      },
    }),
    icon({
      include: {
        lucide: ["arrow-up", "moon", "rss", "search", "sun"],
      },
    }),
    sitemap(),
  ],
});
