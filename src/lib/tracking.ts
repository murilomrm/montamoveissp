// Único ponto do site que fala com window.dataLayer.
// Eventos: clique_whatsapp, gerar_lead, clique_telefone, visualizar_orcamento, scroll_75. Ver docs/GTM.md.
export type Evento = "clique_whatsapp" | "gerar_lead" | "clique_telefone" | "visualizar_orcamento" | "scroll_75";

export function track(evento: Evento, params: Record<string, string | boolean | number | undefined> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: evento, pagina: window.location.pathname, ...params });
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
