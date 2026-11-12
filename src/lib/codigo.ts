import { site } from "@/data/site";
import { lerUtms } from "@/lib/utm";

// Código curto na mensagem do WhatsApp de quem chegou por anúncio do Google (tem gclid, gbraid ou wbraid).
// O código vai para o n8n junto com o identificador do clique; quando o serviço fecha, o #fechou no
// WhatsApp acha o código na conversa e o script do Google Ads registra a venda com o valor.
// Visita orgânica não ganha código: a mensagem sai igual a sempre.
const CHAVE_COD = "mm_cod";
const CHAVE_ENVIADO = "mm_cod_enviado";
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem 0/O, 1/I/L para não confundir

function gerarCodigo(): string {
  let c = "";
  const n = new Uint32Array(4);
  crypto.getRandomValues(n);
  for (const x of n) c += ALFABETO[x % ALFABETO.length];
  return c;
}

export function marcarCliqueAnuncio(a: HTMLAnchorElement): void {
  if (typeof window === "undefined" || !site.webhookCliques) return;
  try {
    const u = lerUtms();
    if (!u.gclid && !u.gbraid && !u.wbraid) return;
    let cod = sessionStorage.getItem(CHAVE_COD) || "";
    if (!cod) {
      cod = gerarCodigo();
      sessionStorage.setItem(CHAVE_COD, cod);
    }
    if (sessionStorage.getItem(CHAVE_ENVIADO) !== cod && navigator.sendBeacon) {
      const dados = new URLSearchParams({ codigo: cod, gclid: u.gclid || "", gbraid: u.gbraid || "", wbraid: u.wbraid || "", pagina: window.location.pathname });
      if (navigator.sendBeacon(site.webhookCliques, dados)) sessionStorage.setItem(CHAVE_ENVIADO, cod);
    }
    const url = new URL(a.href);
    const texto = url.searchParams.get("text") || "";
    if (!texto || texto.includes("Cód.")) return;
    // A frase fixa continua no fim da mensagem (regra 2 do CLAUDE.md); o código entra antes dela.
    const i = texto.indexOf("Vou te enviar");
    const novo = i > 0 ? `${texto.slice(0, i)}(Cód. ${cod}) ${texto.slice(i)}` : `${texto} (Cód. ${cod})`;
    url.searchParams.set("text", novo);
    a.href = url.toString();
  } catch {
    /* sem sessionStorage ou URL inválida: segue sem código */
  }
}
