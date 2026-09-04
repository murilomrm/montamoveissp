// Roda antes do build (npm run build) e também com `npm run seo`.
// Falha se: title > 60, description > 155, marca de loja em title/H1/URL, "R$", "nota fiscal",
// promessa de garantia, promessa de prazo de resposta, forma de pagamento, H1 no corpo do artigo,
// data em artigo do blog, ou placeholder de depoimento em CI.
import fs from "node:fs";
import path from "node:path";
import { servicos } from "../src/data/servicos";
import { paginas, regiaoSEO } from "../src/data/paginas";
import { depoimentos } from "../src/data/depoimentos";
import { faqGeral } from "../src/data/faq";
import { site } from "../src/data/site";
import regioes from "../src/data/regioes.json";

const LIMITE_TITLE = 60;
const LIMITE_DESC = 155;
const MARCAS = ["Mobly", "MadeiraMadeira", "Amazon", "Magalu", "Tok&Stok", "Leroy Merlin"];

// Regras de negócio do marketplace: nada de garantia, prazo prometido ou forma de pagamento.
const PROIBIDOS: { nome: string; re: RegExp; quando: () => boolean }[] = [
  { nome: "valor em reais", re: /R\$/, quando: () => !site.exibirPrecoNoSite },
  { nome: "nota fiscal", re: /nota fiscal/i, quando: () => !site.temCnpj },
  { nome: "promessa de garantia", re: /\bgarant(ia|ias|imos|ido|ida|e|em)\b|\b90 dias\b|asseguramos|voltamos sem custo/i, quando: () => !site.prometerGarantia },
  // Só promessa de RESPOSTA ou de ATENDIMENTO. Duração da montagem (tempoMedio) é informação legítima.
  { nome: "promessa de prazo", re: /resposta imediata|(?:or[çc]amento|resposta|retorno|respondemos|retornamos|receb[ae]\w*)[^.]{0,25}\bem at[ée]?\s*\d+\s*(?:minutos?|min|horas?|h)\b|\bem at[ée]\s*\d+\s*(?:minutos?|min|horas?|h)\b|(?:atendemos|montamos|agendamos|vamos)[^.]{0,25}no mesmo dia|\b\d+\s*minutos?\b[^.]{0,25}(?:or[çc]amento|resposta|retorno)/i, quando: () => !site.prometerPrazoResposta },
  { nome: "forma de pagamento", re: /\bpix\b|cart[ãa]o de cr[ée]dito|maquininha|\bdinheiro\b|adiantamento|\bparcelad/i, quando: () => !site.exibirFormaDePagamento },
];

const erros: string[] = [];
const avisos: string[] = [];
const len = (s: string) => [...s].length;

function checarTitulo(origem: string, title: string, description: string) {
  if (len(title) > LIMITE_TITLE) erros.push(`${origem}: title com ${len(title)} caracteres (máx. ${LIMITE_TITLE}): "${title}"`);
  if (len(description) > LIMITE_DESC) erros.push(`${origem}: description com ${len(description)} caracteres (máx. ${LIMITE_DESC})`);
  if (!title.trim()) erros.push(`${origem}: title vazio`);
  if (!description.trim()) erros.push(`${origem}: description vazia`);
}

function checarTextoProibido(origem: string, texto: string) {
  for (const p of PROIBIDOS) {
    if (!p.quando()) continue;
    const achou = texto.match(p.re);
    if (achou) erros.push(`${origem}: ${p.nome} ("${achou[0]}")`);
  }
  if (/—/.test(texto)) avisos.push(`${origem}: contém travessão`);
}

// 1. Serviços
for (const s of servicos) {
  const origem = `servico ${s.slug}`;
  checarTitulo(origem, s.tituloSEO, s.metaDescription);
  for (const campo of ["tituloSEO", "h1", "metaDescription", "palavraChave", "slug"] as const) {
    for (const marca of MARCAS) {
      if (s[campo].toLowerCase().includes(marca.toLowerCase())) erros.push(`${origem}: marca "${marca}" em ${campo}`);
    }
  }
  if (s.faq.length !== 5) erros.push(`${origem}: ${s.faq.length} FAQs (esperado 5)`);
  // tempoMedio diz quanto dura a montagem, não promete prazo de resposta.
  const { tempoMedio: _ignorado, ...semTempo } = s;
  checarTextoProibido(origem, JSON.stringify(semTempo));
}

// 2. Regiões
for (const r of regioes) {
  const origem = `regiao ${r.slug}`;
  if (!/^[a-z0-9-]+$/.test(r.slug)) erros.push(`${origem}: slug inválido`);
  if (!r.publicada) continue;
  checarTitulo(origem, regiaoSEO.title.replace("{nome}", r.nome), regiaoSEO.description.replace(/{nome}/g, r.nome));
  if (!r.paragrafoUnico.trim()) avisos.push(`${origem}: publicada sem paragrafoUnico, sai com noindex`);
  else {
    const palavras = r.paragrafoUnico.trim().split(/\s+/).length;
    if (palavras < 60 || palavras > 130) avisos.push(`${origem}: paragrafoUnico com ${palavras} palavras (ideal 60 a 120)`);
  }
  checarTextoProibido(origem, r.paragrafoUnico);
}

// 3. Páginas estáticas
for (const [chave, p] of Object.entries(paginas)) {
  checarTitulo(`pagina ${chave}`, p.title, p.description);
  checarTextoProibido(`pagina ${chave}`, `${p.title} ${p.description}`);
}

// 4. Blog
const dirBlog = path.resolve("src/content/blog");
const arquivosBlog = fs.readdirSync(dirBlog).filter((f) => f.endsWith(".md"));
const ordensVistas = new Map<number, string>();
for (const arquivo of arquivosBlog) {
  const conteudo = fs.readFileSync(path.join(dirBlog, arquivo), "utf8");
  const fm = conteudo.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const pegar = (k: string) => fm.match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "") ?? "";
  checarTitulo(`blog ${arquivo}`, pegar("title"), pegar("description"));
  checarTextoProibido(`blog ${arquivo}`, conteudo);
  const corpo = conteudo.replace(/^---[\s\S]*?---/, "");
  if (/^# /m.test(corpo)) erros.push(`blog ${arquivo}: H1 no corpo (o layout já gera o H1)`);
  // Conteúdo perene: nenhum artigo pode ter data.
  if (/^(pubDate|date|updatedDate):/m.test(fm)) erros.push(`blog ${arquivo}: campo de data no frontmatter (o blog é sem data)`);
  const ordem = Number(pegar("ordem"));
  if (!Number.isInteger(ordem)) erros.push(`blog ${arquivo}: campo "ordem" ausente ou inválido`);
  else if (ordensVistas.has(ordem)) avisos.push(`blog ${arquivo}: ordem ${ordem} repetida (também em ${ordensVistas.get(ordem)})`);
  else ordensVistas.set(ordem, arquivo);
}

// 5. FAQ geral
checarTextoProibido("faq geral", JSON.stringify(faqGeral));

// 6. Depoimentos
const placeholders = depoimentos.filter((d) => d.placeholder);
const permitir = process.env.ALLOW_PLACEHOLDERS === "1";
if (placeholders.length && permitir && process.env.CI) erros.push(`depoimentos: ${placeholders.length} placeholder(s) com ALLOW_PLACEHOLDERS=1 em CI. Proibido publicar depoimento de exemplo.`);
else if (placeholders.length && !permitir) avisos.push(`depoimentos: ${placeholders.length} placeholder(s) ocultos. Seção de depoimentos não aparece até haver avaliação real.`);

// 7. Estado das travas de negócio
if (site.prometerGarantia) erros.push("site.ts: prometerGarantia está true. O projeto é um marketplace e não promete garantia.");
if (site.exibirPrecoNoSite) erros.push("site.ts: exibirPrecoNoSite está true. Nenhuma página pode exibir valor em reais.");
if (!site.formularioAtivo) avisos.push("site.ts: formularioAtivo está false. O site mostra o bloco de WhatsApp no lugar do formulário.");

// Relatório
for (const a of avisos) console.warn(`AVISO  ${a}`);
for (const e of erros) console.error(`ERRO   ${e}`);
const publicadas = regioes.filter((r) => r.publicada).length;
console.log(`check-seo: ${servicos.length} serviços, ${publicadas} regiões publicadas, ${Object.keys(paginas).length} páginas estáticas, ${arquivosBlog.length} artigos, ${avisos.length} avisos, ${erros.length} erros`);
if (erros.length) process.exit(1);
