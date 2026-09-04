import type { APIRoute } from "astro";
import { absUrl } from "@/lib/seo";

export const GET: APIRoute = () => {
  const bloquearTudo = import.meta.env.PUBLIC_NOINDEX_ALL === "1";
  const linhas = bloquearTudo
    ? ["User-agent: *", "Disallow: /"]
    : ["User-agent: *", "Allow: /", "Disallow: /obrigado/", "", `Sitemap: ${absUrl("/sitemap-index.xml")}`];
  return new Response(linhas.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
