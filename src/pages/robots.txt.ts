import type { APIRoute } from "astro";
import { absUrl } from "@/lib/seo";
import { bloquearIndexacao } from "@/lib/deploy";

export const GET: APIRoute = () => {
  const bloquearTudo = bloquearIndexacao;
  const linhas = bloquearTudo
    ? ["User-agent: *", "Disallow: /"]
    : ["User-agent: *", "Allow: /", "Disallow: /obrigado/", "", `Sitemap: ${absUrl("/sitemap-index.xml")}`];
  return new Response(linhas.join("\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
