// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import regioes from "./src/data/regioes.json" with { type: "json" };

const siteUrl = process.env.PUBLIC_SITE_URL || "https://www.montamoveissp.com.br";
const basePath = process.env.BASE_PATH || "/";

// Páginas noindex nunca entram no sitemap.
const regioesSemTexto = regioes
  .filter((r) => r.publicada && !r.paragrafoUnico.trim())
  .map((r) => `/montador-de-moveis/${r.slug}/`);
const noindex = ["/obrigado/", "/404", ...regioesSemTexto];

const lastmod = new Date().toISOString();

export default defineConfig({
  site: siteUrl,
  base: basePath,
  trailingSlash: "always",
  output: "static",
  build: { format: "directory" },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(basePath.replace(/\/$/, ""), "");
        return !noindex.some((n) => path === n || path.startsWith(n));
      },
      serialize: (item) => ({ ...item, lastmod }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
