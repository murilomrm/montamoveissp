/**
 * Worker que recebe os leads do site MontaMóveis SP.
 *
 * Segurança:
 * - Nenhum segredo neste arquivo nem no wrangler.toml. ADMIN_USUARIO, ADMIN_SENHA e IP_SALT
 *   entram por `wrangler secret put` e só existem no ambiente da Cloudflare.
 * - O site é estático: qualquer coisa embutida nele é pública. Por isso POST /lead é write-only
 *   e não devolve dado nenhum do banco. Ler exige a senha do painel.
 * - O IP nunca é gravado puro. Guardamos SHA-256 do IP + salt, só para limitar abuso.
 */

export interface Env {
  DB: D1Database;
  FOTOS: R2Bucket;
  ORIGENS_PERMITIDAS: string;
  ADMIN_USUARIO: string; // secret
  ADMIN_SENHA: string; // secret
  IP_SALT: string; // secret
}

const MAX_FOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS_OK = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const LIMITE_POR_HORA = 5; // envios por IP

const LIMITES: Record<string, number> = {
  nome: 80, whatsapp: 11, regiao: 60, servico: 60, moveis: 600, data: 10, pagina: 200,
  utm_source: 100, utm_medium: 100, utm_campaign: 150, utm_term: 150, utm_content: 150, gclid: 200, fbclid: 200,
};

function corsHeaders(origem: string | null, env: Env): Record<string, string> {
  const permitidas = env.ORIGENS_PERMITIDAS.split(",").map((o) => o.trim()).filter(Boolean);
  const ok = origem && permitidas.includes(origem);
  return {
    "Access-Control-Allow-Origin": ok ? origem : permitidas[0] ?? "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** Comparação em tempo constante: não vaza o tamanho do prefixo correto da senha. */
function comparaSegura(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i]! ^ eb[i]!;
  return diff === 0;
}

async function sha256(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function limpar(valor: File | string | null, campo: string): string {
  if (typeof valor !== "string") return "";
  // Remove caracteres de controle e corta no limite do campo.
  return valor.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, LIMITES[campo] ?? 200);
}

function escapaHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function extensao(tipo: string): string {
  return { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic" }[tipo] ?? "bin";
}

function pedeSenha(): Response {
  return new Response("Acesso restrito.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="MontaMoveis SP", charset="UTF-8"' },
  });
}

/** Valida o Basic auth do painel. Sem secret configurado, o painel fica fechado. */
function autorizado(request: Request, env: Env): boolean {
  if (!env.ADMIN_SENHA || !env.ADMIN_USUARIO) return false;
  const header = request.headers.get("Authorization") ?? "";
  if (!header.startsWith("Basic ")) return false;
  let decodificado: string;
  try {
    decodificado = atob(header.slice(6));
  } catch {
    return false;
  }
  const i = decodificado.indexOf(":");
  if (i < 0) return false;
  const usuario = decodificado.slice(0, i);
  const senha = decodificado.slice(i + 1);
  // Avalia os dois lados sempre, para não encurtar o tempo quando o usuário está errado.
  const okUsuario = comparaSegura(usuario, env.ADMIN_USUARIO);
  const okSenha = comparaSegura(senha, env.ADMIN_SENHA);
  return okUsuario && okSenha;
}

async function receberLead(request: Request, env: Env): Promise<Response> {
  const cors = corsHeaders(request.headers.get("Origin"), env);
  const json = (corpo: unknown, status = 200) =>
    new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json", ...cors } });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, erro: "formato_invalido" }, 400);
  }

  // Honeypot: bot preencheu o campo escondido. Responde ok e descarta.
  if (limpar(form.get("site_web"), "pagina")) return json({ ok: true });

  const nome = limpar(form.get("nome"), "nome");
  const whatsapp = limpar(form.get("whatsapp"), "whatsapp").replace(/\D/g, "");
  const regiao = limpar(form.get("regiao"), "regiao");
  const servico = limpar(form.get("servico"), "servico");
  const moveis = limpar(form.get("moveis"), "moveis");

  if (nome.length < 2 || whatsapp.length < 10 || whatsapp.length > 11 || !regiao || !servico || moveis.length < 5) {
    return json({ ok: false, erro: "dados_incompletos" }, 400);
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  const ipHash = env.IP_SALT ? await sha256(`${env.IP_SALT}:${ip}`) : null;

  // Limite por IP na última hora.
  if (ipHash) {
    const desde = new Date(Date.now() - 3600_000).toISOString();
    const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND criado_em > ?")
      .bind(ipHash, desde)
      .first<{ n: number }>();
    if ((r?.n ?? 0) >= LIMITE_POR_HORA) return json({ ok: false, erro: "muitos_envios" }, 429);
  }

  const id = crypto.randomUUID();
  const agora = new Date().toISOString();

  // Fotos: valida tipo e tamanho antes de gravar. A chave inclui o id do lead.
  const arquivos = form.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0).slice(0, MAX_FOTOS);
  const chaves: string[] = [];
  for (const [i, arquivo] of arquivos.entries()) {
    if (arquivo.size > MAX_BYTES || !TIPOS_OK.includes(arquivo.type)) continue;
    const chave = `${agora.slice(0, 10)}/${id}/${i + 1}.${extensao(arquivo.type)}`;
    await env.FOTOS.put(chave, arquivo.stream(), {
      httpMetadata: { contentType: arquivo.type },
      customMetadata: { lead: id },
    });
    chaves.push(chave);
  }

  await env.DB.prepare(
    `INSERT INTO leads (id, criado_em, nome, whatsapp, regiao, servico, moveis, data_desejada, pagina,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, fotos, ip_hash, user_agent)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  )
    .bind(
      id, agora, nome, whatsapp, regiao, servico, moveis,
      limpar(form.get("data"), "data") || null,
      limpar(form.get("pagina"), "pagina") || null,
      limpar(form.get("utm_source"), "utm_source") || null,
      limpar(form.get("utm_medium"), "utm_medium") || null,
      limpar(form.get("utm_campaign"), "utm_campaign") || null,
      limpar(form.get("utm_term"), "utm_term") || null,
      limpar(form.get("utm_content"), "utm_content") || null,
      limpar(form.get("gclid"), "gclid") || null,
      limpar(form.get("fbclid"), "fbclid") || null,
      chaves.length ? JSON.stringify(chaves) : null,
      ipHash,
      (request.headers.get("User-Agent") ?? "").slice(0, 300)
    )
    .run();

  return json({ ok: true, fotos: chaves.length });
}

async function painel(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT id, criado_em, nome, whatsapp, regiao, servico, moveis, data_desejada, pagina, utm_source, fotos FROM leads ORDER BY criado_em DESC LIMIT 200"
  ).all<Record<string, string | null>>();

  const linhas = (results ?? []).map((l) => {
    const fotos: string[] = l.fotos ? JSON.parse(l.fotos) : [];
    const links = fotos
      .map((k, i) => `<a href="/admin/foto/${encodeURIComponent(k)}" target="_blank" rel="noopener">foto ${i + 1}</a>`)
      .join(" ") || "-";
    const zap = (l.whatsapp ?? "").replace(/\D/g, "");
    return `<tr>
      <td>${escapaHtml(new Date(l.criado_em!).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }))}</td>
      <td>${escapaHtml(l.nome ?? "")}</td>
      <td><a href="https://api.whatsapp.com/send/?phone=55${zap}&amp;type=phone_number&amp;app_absent=0" target="_blank" rel="noopener">${escapaHtml(l.whatsapp ?? "")}</a></td>
      <td>${escapaHtml(l.regiao ?? "")}</td>
      <td>${escapaHtml(l.servico ?? "")}</td>
      <td>${escapaHtml(l.moveis ?? "")}</td>
      <td>${escapaHtml(l.data_desejada ?? "-")}</td>
      <td>${links}</td>
      <td>${escapaHtml(l.utm_source ?? "-")}</td>
    </tr>`;
  }).join("");

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Leads MontaMóveis SP</title><style>
body{font-family:system-ui,sans-serif;margin:0;padding:24px;background:#f3f4f6;color:#1f2937}
h1{color:#1f3a5f;font-size:20px;margin:0 0 4px}p.sub{margin:0 0 16px;color:#6b7280;font-size:14px}
.wrap{overflow-x:auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px}
table{border-collapse:collapse;width:100%;font-size:13px;min-width:980px}
th,td{padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top}
th{background:#1f3a5f;color:#fff;position:sticky;top:0}td:nth-child(6){max-width:320px}
a{color:#1f3a5f}tr:hover td{background:#f9fafb}
.top{display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.btn{display:inline-block;background:#1f3a5f;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-size:14px}
</style></head><body>
<div class="top"><div><h1>Leads MontaMóveis SP</h1><p class="sub">${(results ?? []).length} registro(s), mais recentes primeiro. Máximo de 200 por página.</p></div>
<a class="btn" href="/admin/export.csv">Baixar CSV</a></div>
<div class="wrap"><table><thead><tr>
<th>Quando</th><th>Nome</th><th>WhatsApp</th><th>Região</th><th>Serviço</th><th>Móveis</th><th>Data</th><th>Fotos</th><th>Origem</th>
</tr></thead><tbody>${linhas || '<tr><td colspan="9">Nenhum lead ainda.</td></tr>'}</tbody></table></div>
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

async function exportarCsv(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT * FROM leads ORDER BY criado_em DESC").all<Record<string, unknown>>();
  const colunas = ["criado_em", "nome", "whatsapp", "regiao", "servico", "moveis", "data_desejada", "pagina", "utm_source", "utm_medium", "utm_campaign", "fotos"];
  // Prefixo apóstrofo em campo que começa com = + - @ evita execução de fórmula ao abrir no Excel.
  const celula = (v: unknown) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [colunas.join(","), ...(results ?? []).map((l) => colunas.map((c) => celula(l[c])).join(","))].join("\n");
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const caminho = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("Origin"), env) });
    }

    if (caminho === "/lead" && request.method === "POST") {
      try {
        return await receberLead(request, env);
      } catch {
        // Nunca devolve a mensagem interna do erro: ela pode expor estrutura do banco.
        return new Response(JSON.stringify({ ok: false, erro: "falha_interna" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("Origin"), env) },
        });
      }
    }

    if (caminho === "/admin" || caminho.startsWith("/admin/")) {
      if (!autorizado(request, env)) return pedeSenha();
      if (caminho === "/admin") return painel(env);
      if (caminho === "/admin/export.csv") return exportarCsv(env);
      if (caminho.startsWith("/admin/foto/")) {
        const chave = decodeURIComponent(caminho.slice("/admin/foto/".length));
        const objeto = await env.FOTOS.get(chave);
        if (!objeto) return new Response("Foto não encontrada.", { status: 404 });
        return new Response(objeto.body, {
          headers: {
            "Content-Type": objeto.httpMetadata?.contentType ?? "application/octet-stream",
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
      return new Response("Não encontrado.", { status: 404 });
    }

    return new Response("MontaMoveis SP leads. Use POST /lead.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
} satisfies ExportedHandler<Env>;
