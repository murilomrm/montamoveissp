# MontaMóveis SP

Site estático de geração de leads para montagem e desmontagem de móveis em São Paulo. Astro + Tailwind + TypeScript. Deploy no GitHub Pages. Conversão só pelo WhatsApp.

Regras do projeto estão em `CLAUDE.md`. Leia antes de mexer.

## Rodar local

```bash
nvm use            # Node 22 (arquivo .nvmrc)
npm install
cp .env.example .env
npm run dev        # http://localhost:4321
```

- `npm run build` gera `dist/`. Antes roda `scripts/check-seo.ts` (title > 60, description > 155, "R$", "nota fiscal" ou placeholder em CI fazem o build falhar).
- `npm run preview` serve o `dist/`.
- `npm run check` roda `astro check` (tipos).
- `ALLOW_PLACEHOLDERS=1 npm run dev` mostra os depoimentos de exemplo só no local.

## Deploy

Push na branch `main` dispara `.github/workflows/deploy.yml`, que builda e publica no GitHub Pages.

### Estado atual: sem domínio próprio

Sem a variável `CUSTOM_DOMAIN`, o site sai em `https://murilomrm.github.io/montamoveissp/` com `noindex` em todas as páginas e `robots.txt` bloqueando tudo. Isso evita que o Google indexe a URL provisória.

### Ligar o domínio montamoveissp.com.br

1. No registrador do domínio, crie os registros DNS:
   - `www` CNAME `murilomrm.github.io`
   - Apex (`@`) com os 4 registros A do GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
2. No GitHub, Settings > Secrets and variables > Actions > Variables: crie `CUSTOM_DOMAIN` = `www.montamoveissp.com.br`.
3. Settings > Pages > Custom domain: `www.montamoveissp.com.br`. Marque "Enforce HTTPS" quando o certificado sair.
4. Rode o workflow de novo (Actions > Deploy > Run workflow). O build passa a usar `BASE_PATH=/`, canonical no domínio, sem `noindex`, e grava `dist/CNAME`.
5. O GitHub redireciona `montamoveissp.com.br` para `www` sozinho quando os dois registros existem.

### Variáveis de ambiente

| Variável | Onde | Para quê |
|---|---|---|
| `PUBLIC_GTM_ID` | Variable no GitHub e `.env` | ID do GTM. Vazio = nenhum script de terceiros |
| `PUBLIC_LEAD_ENDPOINT` | Variable no GitHub e `.env` | URL do Worker que grava o lead no banco (`docs/BACKEND.md`) |
| `CUSTOM_DOMAIN` | Variable no GitHub | Domínio próprio. Define `PUBLIC_SITE_URL`, `BASE_PATH` e tira o `noindex` |
| `PUBLIC_SITE_URL`, `BASE_PATH`, `PUBLIC_NOINDEX_ALL` | Calculadas no workflow. Local: `.env` | URL, subpasta e noindex global |
| `ALLOW_PLACEHOLDERS` | Só local | Mostra depoimentos de exemplo |

## Tarefas comuns

- **Ligar GTM, GA4, Meta Pixel, Google Ads:** `docs/GTM.md`.
- **Ligar o formulário e o banco de leads:** `docs/BACKEND.md`.
- **Publicar região:** `docs/PUBLICAR_REGIAO.md`.
- **Colocar fotos:** `docs/FOTOS.md` e `PROMPT_NANO_BANANA_FOTOS.md`.
- **Criar artigo:** novo `.md` em `src/content/blog/` com frontmatter `title` (máx. 60), `description` (máx. 155), `ordem` (número que define a posição na listagem), `tags` e `imagem` opcional. Sem data: o blog é perene. Use `##` e `###`, nunca `#`. Links internos como `/orcamento/`.
- **Trocar WhatsApp ou horário:** `src/data/site.ts`.
- **Religar o formulário:** `formularioAtivo: true` em `src/data/site.ts`, depois de seguir `docs/BACKEND.md`.
- **Abrir MEI / CNPJ:** em `site.ts`, `temCnpj: true` e preencha `cnpj`, `razaoSocial`. Depois procure `// NOTA FISCAL: liberar aqui` (`src/data/faq.ts`, `src/pages/sobre.astro`).
- **Adicionar e-mail:** `temEmail: true` e `email` em `site.ts`. Rodapé e contato passam a mostrar.
- **Depoimentos reais:** `src/data/depoimentos.ts`, `placeholder: false`.

## Estrutura

```
worker/        Cloudflare Worker que recebe o formulário (D1 + R2). Ver docs/BACKEND.md
src/
  data/        site.ts, servicos.ts, regioes.json, faq.ts, depoimentos.ts, paginas.ts, types.ts
  components/  SEO, Header, Footer, WhatsAppButton, WhatsAppFloat, LeadForm, FAQ, Breadcrumb, Tracking, CookieBanner, ServiceCard, RegionGrid, Steps, Provas, Testimonials, CTAFinal, Foto
  layouts/     Base.astro
  lib/         whatsapp.ts, tracking.ts, seo.ts, utm.ts, url.ts, regioes.ts
  pages/       index, [servico], montador-de-moveis/, orcamento, sobre, contato, trabalhe-conosco, blog/, politica-de-privacidade, obrigado, 404, robots.txt.ts
  content/blog/*.md
scripts/check-seo.ts
docs/
public/        og.png, favicon.svg, apple-touch-icon.png, img/
```

## Decisões de implementação

- Tailwind 4: paleta em `src/styles/global.css` (`@theme`), não em `tailwind.config`.
- Sem `vercel.json`: o deploy é GitHub Pages. Redirect apex para `www` é feito pelo próprio GitHub.
- Sem `PriceTable`: `exibirPrecoNoSite` é sempre `false`. A página `/orcamento/` faz o papel.
- A empresa é um marketplace. O site nunca promete garantia, prazo de resposta ou forma de pagamento. As travas ficam em `src/data/site.ts` e o `check-seo` derruba o build se algum texto violar.
- Formulário desligado por `formularioAtivo: false`. O componente `LeadForm` renderiza um bloco de WhatsApp no lugar, então nenhuma página precisa mudar para ligar ou desligar.
- Blog sem data, ordenado pelo campo `ordem` do frontmatter.
- Links internos passam por `href()` de `src/lib/url.ts` para funcionar em subpasta. Com domínio próprio a função vira identidade.
- Imagens em `public/img/` são servidas como estão (o `Foto.astro` só coloca `width`, `height` e lazy). Comprima em WebP antes de subir.
