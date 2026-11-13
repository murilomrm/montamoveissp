import { marcarCliqueAnuncio } from "@/lib/codigo";

// Único ponto do site que fala com window.dataLayer, com o gtag do Google Ads e com o oaiq do ChatGPT Ads.
// Eventos: clique_whatsapp, gerar_lead, clique_telefone, visualizar_orcamento, scroll_75. Ver docs/TRACKING.md.
export type Evento = "clique_whatsapp" | "gerar_lead" | "clique_telefone" | "visualizar_orcamento" | "scroll_75";

// Vindas do ambiente, nunca hardcoded. Vazias: nada é enviado e nada quebra.
const ADS_ID = import.meta.env.PUBLIC_GOOGLE_ADS_ID?.trim() || "";
const ADS_LABEL = import.meta.env.PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() || "";
const OPENAI_PIXEL_ID = import.meta.env.PUBLIC_OPENAI_PIXEL_ID?.trim() || "";

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

/**
 * Dispara a conversão no ChatGPT Ads (evento lead_created, "Clique WhatsApp" no Ads Manager).
 * Mesma regra do Google Ads: sem variável de ambiente ou sem o pixel carregado, não faz nada.
 */
export function dispararConversaoOpenAI(): void {
  if (typeof window === "undefined") return;
  if (!OPENAI_PIXEL_ID) return;
  if (typeof window.oaiq !== "function") return;
  window.oaiq("measure", "lead_created", { type: "customer_action" });
}

/**
 * Manda o evento para o GA4 (G-0Z383X048N). O GA4 não está no código: ele é destino da mesma tag do Google
 * que o site já carrega (AW-18433016209), configurado no painel do GA4. Por isso o gtag("event") sem send_to
 * chega ao GA4 sem precisar de outro script nem de variável nova. Sem gtag carregado, não faz nada.
 */
function enviarParaGA4(evento: Evento, params: Record<string, string | boolean | number | undefined>): void {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", evento, params);
}

export function track(evento: Evento, params: Record<string, string | boolean | number | undefined> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: evento, pagina: window.location.pathname, ...params });
  enviarParaGA4(evento, { pagina: window.location.pathname, ...params });

  // A conversão do Ads é adicional: o push acima continua acontecendo do mesmo jeito.
  if (EVENTOS_DE_CONVERSAO.includes(evento)) {
    dispararConversaoGoogleAds();
    dispararConversaoOpenAI();
  }
}

// Delegação global: qualquer <a data-wa> dispara clique_whatsapp; qualquer href="tel:" dispara clique_telefone.
export function iniciarTrackingGlobal(): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];

  // Caixinha do valor mínimo (src/components/ConfirmaMinimo.astro). Se ela existir, o clique no WhatsApp
  // para nela: só quem responde "Sim" segue para a conversa, e só aí dispara clique_whatsapp (conversão do Ads).
  // Quem já confirmou nesta sessão vai direto.
  const dialogo = document.getElementById("confirma-minimo") as HTMLDialogElement | null;
  const CHAVE_OK = "mm_minimo_ok";
  let pendente: HTMLAnchorElement | null = null;
  const jaConfirmou = () => {
    try { return sessionStorage.getItem(CHAVE_OK) === "1"; } catch { return false; }
  };
  const registrarClique = (a: HTMLAnchorElement) => {
    marcarCliqueAnuncio(a);
    track("clique_whatsapp", {
      origem: a.dataset.origem || "link",
      servico: a.dataset.servico || "",
      regiao: a.dataset.regiao || "",
    });
  };

  if (dialogo && typeof dialogo.showModal === "function") {
    dialogo.addEventListener("click", (e) => {
      const botao = (e.target as HTMLElement | null)?.closest("[data-confirma]") as HTMLElement | null;
      if (!botao) {
        if (e.target === dialogo) dialogo.close(); // clique no fundo escuro fecha
        return;
      }
      const a = pendente;
      pendente = null;
      dialogo.close();
      if (botao.dataset.confirma !== "sim" || !a) return;
      try { sessionStorage.setItem(CHAVE_OK, "1"); } catch { /* sem storage, pergunta de novo na próxima */ }
      registrarClique(a);
      // Sem "noopener" no window.open porque com ele o retorno é sempre null; o opener é limpo logo depois.
      const aba = window.open(a.href, "_blank");
      if (aba) aba.opener = null;
      else window.location.href = a.href; // pop-up bloqueado: abre na mesma aba

    });
  }

  document.addEventListener("click", (e) => {
    const alvo = (e.target as HTMLElement | null)?.closest("a") as HTMLAnchorElement | null;
    if (!alvo) return;
    if (alvo.hasAttribute("data-wa")) {
      if (dialogo && typeof dialogo.showModal === "function" && !jaConfirmou()) {
        e.preventDefault();
        pendente = alvo;
        dialogo.showModal();
        return;
      }
      registrarClique(alvo);
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
