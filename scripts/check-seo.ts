// Roda antes do build (npm run build) e também com `npm run seo`.
// Falha se: title > 60, description > 155, marca de loja em title/H1, "R$" ou "nota fiscal" onde não pode,
// placeholder de depoimento com ALLOW_PLACEHOLDERS em CI. Avisa regiões publicadas sem parágrafo.
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
  if (/R\$\s?\d/.test(texto) || /\bR\$/.test(texto)) erros.push(`${origem}: contém valor em reais (R$)`);
  if (!site.temCnpj && /nota fiscal/i.test(texto)) erros.push(`${origem}: menciona "nota fiscal" com temCnpj = false`);
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
  checarTextoProibido(origem, JSON.stringify(s));
}

// 2. Regiões
for (const r of regioes) {
  const origem = `regiao ${r.slug}`;
  if (!/^[a-z0-9-]+$/.test(r.slug)) erros.push(`${origem}: slug inválido`);
  if (!r.publicada) continue;
  checarTitulo(origem, regiaoSEO.title.replace("{nome}", r.nome), regiaoSEO.description.replace("{nome}", r.nome));
  if (!r.paragrafoUnico.trim()) avisos.push(`${origem}: publicada sem paragrafoUnico, sai com noindex`);
  else {
    const palavras = r.paragrafoUnico.trim().split(/\s+/).length;
    if (palavras < 60 || palavras > 130) avisos.push(`${origem}: paragrafoUnico com ${palavras} palavras (ideal 60 a 120)`);
  }
  checarTextoProibido(origem, r.paragrafoUnico);
}

// 3. Páginas estáticas
for (const [chave, p] of Object.entries(paginas)) checarTitulo(`pagina ${chave}`, p.title, p.description);

// 4. Blog (frontmatter)
const dirBlog = path.resolve("src/content/blog");
for (const arquivo of fs.readdirSync(dirBlog).filter((f) => f.endsWith(".md"))) {
  const conteudo = fs.readFileSync(path.join(dirBlog, arquivo), "utf8");
  const fm = conteudo.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const pegar = (k: string) => fm.match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "") ?? "";
  checarTitulo(`blog ${arquivo}`, pegar("title"), pegar("description"));
  checarTextoProibido(`blog ${arquivo}`, conteudo);
  const corpo = conteudo.replace(/^---[\s\S]*?---/, "");
  if (/^# /m.test(corpo)) erros.push(`blog ${arquivo}: H1 no corpo (o layout já gera o H1)`);
}

// 5. FAQ geral
checarTextoProibido("faq geral", JSON.stringify(faqGeral));

// 6. Depoimentos
const placeholders = depoimentos.filter((d) => d.placeholder);
const permitir = process.env.ALLOW_PLACEHOLDERS === "1";
if (placeholders.length && permitir && process.env.CI) erros.push(`depoimentos: ${placeholders.length} placeholder(s) com ALLOW_PLACEHOLDERS=1 em CI. Proibido publicar depoimento de exemplo.`);
else if (placeholders.length && !permitir) avisos.push(`depoimentos: ${placeholders.length} placeholder(s) ocultos. Seção de depoimentos não aparece até haver avaliação real.`);

// Relatório
for (const a of avisos) console.warn(`AVISO  ${a}`);
for (const e of erros) console.error(`ERRO   ${e}`);
const publicadas = regioes.filter((r) => r.publicada).length;
console.log(`check-seo: ${servicos.length} serviços, ${publicadas} regiões publicadas, ${Object.keys(paginas).length} páginas estáticas, ${avisos.length} avisos, ${erros.length} erros`);
if (erros.length) process.exit(1);
