// Contexto do build. Só roda no build (Node), nunca no navegador.
// O Cloudflare Pages define CF_PAGES, CF_PAGES_BRANCH e CF_PAGES_URL automaticamente.
const branch = process.env.CF_PAGES_BRANCH ?? "";
const noPages = process.env.CF_PAGES === "1";

/** Deploy de preview: qualquer branch que não seja a principal. */
export const ehPreview = noPages && branch !== "" && branch !== "main";

/** Preview nunca é indexado, para não competir com o domínio de produção por conteúdo duplicado. */
export const bloquearIndexacao = process.env.PUBLIC_NOINDEX_ALL === "1" || ehPreview;

export const branchAtual = branch;
