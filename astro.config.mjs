// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import regioes from "./src/data/regioes.json" with { type: "json" };

// Build e publicação acontecem no Cloudflare Pages. O GitHub só guarda o código.
// Site 100% estático: sem @astrojs/cloudflare, sem adapter, sem output "server".
const siteUrl = process.env.PUBLIC_SITE_URL || "https://www.montamoveissp.com.br";

// Páginas noindex nunca entram no sitemap.
const noindex = [
  "/obrigado/",
  "/404",
  ...regioes.filter((r) => r.publicada && !r.paragrafoUnico.trim()).map((r) => `/montador-de-moveis/${r.slug}/`),
];

const lastmod = new Date().toISOString();

export default defineConfig({
  site: siteUrl,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !noindex.some((n) => pathname === n || pathname.startsWith(n));
      },
      serialize: (item) => ({ ...item, lastmod }),
    }),
  ],
  // Tailwind 4 entra pelo plugin do Vite. O antigo @astrojs/tailwind é da linha 3 e não se aplica.
  vite: { plugins: [tailwindcss()] },
});
