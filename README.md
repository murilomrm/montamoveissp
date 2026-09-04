# MontaMóveis SP

Site estático de geração de leads para montagem e desmontagem de móveis em São Paulo. Astro + Tailwind 4 + TypeScript. A empresa é um **marketplace**: conecta cliente e montador, não executa o serviço. Isso limita o que o site pode prometer, e as travas estão em `src/data/site.ts`.

Regras do projeto em `CLAUDE.md`. Leia antes de mexer.

## Rodar local

```bash
nvm use            # Node 22 (arquivo .nvmrc)
npm install
cp .env.example .env
npm run dev        # http://localhost:4321
```

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | roda `check-seo` e depois `astro build`, saída em `dist/` |
| `npm run check-seo` | só o validador de conteúdo |
| `npm run preview` | serve o `dist/` |
| `npm run check` | `astro check` (tipos) |

O `check-seo` derruba o build se um title passar de 60 caracteres, uma description passar de 155, uma região `publicada: true` estiver sem `paragrafoUnico`, ou se algum texto violar as regras de negócio (preço em reais, garantia, prazo de resposta, forma de pagamento, nota fiscal).

`ALLOW_PLACEHOLDERS=1 npm run dev` mostra os depoimentos de exemplo, só no local.

## Deploy: Cloudflare Pages

O GitHub guarda o código. O build e a publicação acontecem no Cloudflare Pages. Não existe workflow de GitHub Actions, nem `vercel.json`, nem `netlify.toml`.

### Criar o projeto no painel, uma vez

1. Cloudflare > Workers & Pages > Create > Pages > Connect to Git.
2. Autorize e escolha o repositório `murilomrm/montamoveissp`.
3. Configure o build:

   | Campo | Valor |
   |---|---|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | vazio (raiz do repositório) |
   | Production branch | `main` |

4. Em Environment variables, adicione o que for necessário (tabela abaixo). Se o Cloudflare escolher um Node antigo, adicione a variável `NODE_VERSION` com valor `22`. O arquivo `.nvmrc` já pede isso.
5. Save and Deploy.

A pasta `worker/` não faz parte deste build. Ela é um projeto separado, ainda não usado, e o Pages a ignora porque o build só roda `npm run build` na raiz.

### Variáveis de ambiente

Definidas em **Cloudflare Pages > Projeto > Settings > Environment variables**, com escopos **Production** e **Preview** separados. Nenhuma delas vai para o repositório: `.env` está no `.gitignore`.

| Variável | Escopo | Para quê |
|---|---|---|
| `PUBLIC_SITE_URL` | Production | `https://www.montamoveissp.com.br`. Monta canonical, sitemap e Open Graph |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Production | Token do Cloudflare Web Analytics. Sem cookie, sem banner. Vazio = nada é carregado |
| `PUBLIC_GTM_ID` | Production | ID do Google Tag Manager. Vazio = nenhum script de terceiros. Ver `docs/GTM.md` |
| `PUBLIC_LEAD_ENDPOINT` | Production | URL do backend do formulário. Só usada com `formularioAtivo: true`. Ver `docs/BACKEND.md` |
| `PUBLIC_NOINDEX_ALL` | qualquer | `1` força noindex em tudo. Preview já sai com noindex sozinho |

Todas toleram valor vazio. Nada quebra, nada aparece pela metade para o visitante.

### Preview por branch

O Cloudflare Pages publica uma URL de preview para cada branch e cada pull request, no formato `nome-da-branch.montamoveissp.pages.dev`.

**Não faça push de teste direto em `main`. Crie uma branch, veja o preview no link que o Cloudflare gera, aprove, e faça o merge.**

```bash
git checkout -b nova-regiao-santana
# edite, commite
git push -u origin nova-regiao-santana
# abra o link de preview que aparece no painel ou no PR
```

Todo deploy de preview sai com `noindex, nofollow` e `robots.txt` bloqueando tudo, automaticamente. O site detecta a branch pela variável `CF_PAGES_BRANCH`, que o Cloudflare define sozinho. Só `main` é indexável. Isso evita que o `.pages.dev` concorra com o domínio no Google.

### Domínio

No projeto do Pages, em Custom domains, adicione `www.montamoveissp.com.br` e `montamoveissp.com.br`. Como o DNS já está na Cloudflare, os registros são criados sozinhos e o certificado sai em minutos.

O canonical do site é o `www`. O redirecionamento do apex para o `www` é feito por Redirect Rule no painel, em Rules > Redirect Rules, e não no código.

### Cabeçalhos e redirecionamentos

Dois arquivos em `public/`, copiados para a raiz do build e lidos pelo Cloudflare Pages:

- `public/_headers`: segurança (HSTS, nosniff, clickjacking, permissions policy) e cache. Assets com hash no nome ficam imutáveis por um ano; HTML sempre revalida.
- `public/_redirects`: as rotas antigas `/precos` para `/orcamento/`.

Regras entre hostnames diferentes (ex.: apex → www) devem ser criadas como Redirect Rule no painel do Cloudflare, não neste arquivo, que só aceita caminhos relativos. URL absoluta aqui faz o build do Pages falhar.

Não crie redirecionamento para rota que já existe. Esses arquivos são só para migração e canonical.

## Tarefas comuns

- **Ligar GTM, GA4, Meta Pixel, Google Ads:** `docs/GTM.md`.
- **Ligar o formulário e o banco de leads:** `docs/BACKEND.md`.
- **Publicar região:** `docs/PUBLICAR_REGIAO.md`.
- **Colocar fotos:** `docs/FOTOS.md`.
- **Criar artigo:** novo `.md` em `src/content/blog/` com frontmatter `title` (máx. 60), `description` (máx. 155), `ordem`, `tags` e `imagem` opcional. Sem data: o blog é perene. Use `##` e `###`, nunca `#`.
- **Trocar WhatsApp ou horário:** `src/data/site.ts`.
- **Religar o formulário:** `formularioAtivo: true` em `src/data/site.ts`, depois de seguir `docs/BACKEND.md`.
- **Abrir MEI / CNPJ:** em `site.ts`, `temCnpj: true` e preencha `cnpj` e `razaoSocial`. Depois procure `// NOTA FISCAL: liberar aqui`.
- **Adicionar e-mail:** `temEmail: true` e `email` em `site.ts`.
- **Depoimentos reais:** `src/data/depoimentos.ts`, `placeholder: false`.

## Estrutura

```
public/        _headers, _redirects, og.png, favicon.svg, apple-touch-icon.png, img/
worker/        backend opcional do formulário (Cloudflare Worker + D1 + R2). Fora do build do site
src/
  data/        site.ts, servicos.ts, regioes.json, faq.ts, depoimentos.ts, paginas.ts, types.ts
  components/  SEO, Header, Footer, WhatsAppButton, WhatsAppFloat, LeadForm, BlocoWhatsapp, FAQ,
               Breadcrumb, Tracking, CloudflareAnalytics, CookieBanner, ServiceCard, RegionGrid,
               Steps, Provas, Testimonials, CTAFinal, Foto
  layouts/     Base.astro
  lib/         whatsapp.ts, tracking.ts, seo.ts, utm.ts, url.ts, regioes.ts, deploy.ts
  pages/       index, [servico], montador-de-moveis/, orcamento, sobre, contato, trabalhe-conosco,
               blog/, politica-de-privacidade, obrigado, 404, robots.txt.ts
  content/blog/*.md
scripts/       check-seo.ts
docs/
```

## Decisões de implementação

- Site 100% estático. Sem `@astrojs/cloudflare`, sem adapter, sem `output: "server"`. Se um dia surgir rota dinâmica, aí sim se adiciona o adapter junto com `output: "server"`.
- Sem `wrangler.toml` na raiz e sem `functions/`. O Pages tem o próprio builder e não precisa de Wrangler para servir estático.
- Tailwind 4 entra pelo plugin do Vite (`@tailwindcss/vite`). O `@astrojs/tailwind` é da linha 3 e não se aplica aqui. A paleta fica em `src/styles/global.css`, no bloco `@theme`, não em `tailwind.config`.
- O site nunca promete garantia, prazo de resposta ou forma de pagamento. As travas ficam em `src/data/site.ts` e o `check-seo` derruba o build se algum texto violar.
- Formulário desligado por `formularioAtivo: false`. O `LeadForm` renderiza um bloco de WhatsApp no lugar, então nenhuma página precisa mudar para ligar ou desligar.
- Blog sem data, ordenado pelo campo `ordem` do frontmatter.
- Nenhum link canônico é escrito à mão. Tudo sai de `site` no `astro.config.mjs`, via `src/lib/seo.ts`. Nenhum caminho `.pages.dev` aparece no código.
