import { site } from "@/data/site";
import type { FaqItem } from "@/data/types";

const siteUrl = site.dominio.replace(/\/+$/, "");
const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

// URL absoluta de um caminho interno (já considera o base path).
export function absUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl}${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const idLocalBusiness = `${siteUrl}${base}/#negocio`;

export function localBusiness() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": idLocalBusiness,
    name: site.nome,
    url: absUrl("/"),
    telephone: `+${site.whatsapp}`,
    image: absUrl("/og.png"),
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: site.enderecoBase.cidade,
      addressRegion: site.enderecoBase.uf,
      addressCountry: "BR",
    },
    areaServed: site.areaAtendida.map((c) => ({ "@type": "City", name: c })),
    openingHoursSpecification: site.horarioSchema.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dias,
      opens: h.abre,
      closes: h.fecha,
    })),
    ...(site.instagram ? { sameAs: [site.instagram] } : {}),
  };
}

export function schemaService(opts: { nome: string; descricao: string; url: string; areaServed?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.nome,
    description: opts.descricao,
    url: absUrl(opts.url),
    serviceType: opts.nome,
    provider: { "@id": idLocalBusiness },
    areaServed: (opts.areaServed ?? [...site.areaAtendida]).map((c) => ({ "@type": "City", name: c })),
  };
}

export function schemaFaq(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.pergunta,
      acceptedAnswer: { "@type": "Answer", text: f.resposta },
    })),
  };
}

export interface Crumb {
  nome: string;
  url: string;
}

export function schemaBreadcrumb(itens: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.nome,
      item: absUrl(c.url),
    })),
  };
}

export function schemaArticle(opts: { titulo: string; descricao: string; url: string; publicado: Date; atualizado?: Date; imagem?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.titulo,
    description: opts.descricao,
    url: absUrl(opts.url),
    mainEntityOfPage: absUrl(opts.url),
    datePublished: opts.publicado.toISOString(),
    dateModified: (opts.atualizado ?? opts.publicado).toISOString(),
    image: absUrl(opts.imagem ?? "/og.png"),
    author: { "@type": "Organization", name: site.nome, "@id": idLocalBusiness },
    publisher: { "@type": "Organization", name: site.nome, "@id": idLocalBusiness },
    inLanguage: "pt-BR",
  };
}
