// Guarda utm_* da primeira visita em sessionStorage (nunca localStorage, regra do projeto).
const CHAVE = "mm_utm";
const CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const;

export type Utms = Partial<Record<(typeof CAMPOS)[number], string>>;

export function capturarUtms(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(CHAVE)) return;
    const params = new URLSearchParams(window.location.search);
    const utms: Utms = {};
    for (const c of CAMPOS) {
      const v = params.get(c);
      if (v) utms[c] = v.slice(0, 200);
    }
    if (Object.keys(utms).length) sessionStorage.setItem(CHAVE, JSON.stringify(utms));
  } catch {
    /* sessionStorage indisponível (modo privado antigo). Segue sem UTM. */
  }
}

export function lerUtms(): Utms {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE) || "{}") as Utms;
  } catch {
    return {};
  }
}
