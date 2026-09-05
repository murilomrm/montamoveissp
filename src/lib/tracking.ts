// Único ponto do site que fala com window.dataLayer e com o gtag do Google Ads.
// Eventos: clique_whatsapp, gerar_lead, clique_telefone, visualizar_orcamento, scroll_75. Ver docs/TRACKING.md.
export type Evento = "clique_whatsapp" | "gerar_lead" | "clique_telefone" | "visualizar_orcamento" | "scroll_75";

// Vindas do ambiente, nunca hardcoded. Vazias: nada é enviado e nada quebra.
const ADS_ID = import.meta.env.PUBLIC_GOOGLE_ADS_ID?.trim() || "";
const ADS_LABEL = import.meta.env.PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() || "";

// Eventos que contam como conversão no Google Ads.
// clique_whatsapp cobre botão flutuante, hero, cards, rodapé, cabeçalho, CTA e páginas de região.
// gerar_lead cobre o formulário, que hoje está desligado (site.formularioAtivo).
const EVENTOS_DE_CONVERSAO: Evento[] = ["clique_whatsapp", "gerar_lead"];

/**
 * Dispara a conversão no Google Ads.
 * Silenciosa e segura: sem variáveis de ambiente, ou com a tag ainda não carregada
 * (bloqueador, rede lenta, consentimento negado), não faz nada e não lança erro.
 */
export function dispararConversaoGoogleAds(): void {
  if (typeof window === "undefined") return;
  if (!ADS_ID || !ADS_LABEL) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: `${ADS_ID}/${ADS_LABEL}` });
}

export function track(evento: Evento, params: Record<string, string | boolean | number | undefined> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: evento, pagina: window.location.pathname, ...params });

  // A conversão do Ads é adicional: o push acima continua acontecendo do mesmo jeito.
  if (EVENTOS_DE_CONVERSAO.includes(evento)) dispararConversaoGoogleAds();
}

// Delegação global: qualquer <a data-wa> dispara clique_whatsapp; qualquer href="tel:" dispara clique_telefone.
export function iniciarTrackingGlobal(): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];

  document.addEventListener("click", (e) => {
    const alvo = (e.target as HTMLElement | null)?.closest("a") as HTMLAnchorElement | null;
    if (!alvo) return;
    if (alvo.hasAttribute("data-wa")) {
      track("clique_whatsapp", {
        origem: alvo.dataset.origem || "link",
        servico: alvo.dataset.servico || "",
        regiao: alvo.dataset.regiao || "",
      });
      return;
    }
    if (alvo.getAttribute("href")?.startsWith("tel:")) {
      track("clique_telefone");
    }
  });

  const tipoPagina = document.body.dataset.tipoPagina;
  if (tipoPagina === "servico" || tipoPagina === "regiao") {
    let disparou = false;
    const checar = () => {
      if (disparou) return;
      const alt = document.documentElement.scrollHeight - window.innerHeight;
      if (alt <= 0) return;
      if (window.scrollY / alt >= 0.75) {
        disparou = true;
        track("scroll_75", { tipo_pagina: tipoPagina });
        window.removeEventListener("scroll", checar);
      }
    };
    window.addEventListener("scroll", checar, { passive: true });
  }

  if (tipoPagina === "orcamento") {
    track("visualizar_orcamento");
  }
}
