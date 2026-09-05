# CLAUDE.md

Site de geração de leads da MontaMóveis SP, um **marketplace** que conecta clientes a montadores de móveis em São Paulo, ABC e Grande SP. Domínio: montamoveissp.com.br. Objetivo único: ranquear no Google para "montador de móveis + região" e converter em conversa no WhatsApp.

A empresa não executa a montagem: ela intermedeia. Isso muda o que o site pode prometer (ver regras 9, 10 e 11).

## Stack

- Astro (estático) + Tailwind 4 + TypeScript. Deploy em Cloudflare Pages, conectado ao repositório do GitHub.
- Backend só para o formulário: Cloudflare Worker + D1 + R2, na pasta `worker/`.
- Sem CMS. Conteúdo em `src/data/` e `src/content/blog/`.
- Antes de instalar qualquer pacote: `npm view <pacote> version`. Não usar versões de memória.

## Comandos

- `npm run dev` desenvolvimento
- `npm run build` build de produção (roda `scripts/check-seo.ts` antes; o build falha se alguma regra abaixo for violada)
- `npm run seo` só o validador
- `npm run preview` pré-visualização do build
- `npm run check` `astro check` + typescript

## Regras que não mudam

1. Todo dado da empresa (WhatsApp, horário) vem de `src/data/site.ts`. Nunca hardcoded em componente.
2. Todo link de WhatsApp passa por `src/lib/whatsapp.ts`. Formato `api.whatsapp.com/send/?phone=...&text=...&type=phone_number&app_absent=0`. Toda mensagem termina com "Vou te enviar fotos do que é necessário montar e localização com data aproximada." Número atual: `+55 11 98204 3902`.
3. Todo evento de tracking passa por `src/lib/tracking.ts`. Nomes: `clique_whatsapp`, `gerar_lead`, `clique_telefone`, `visualizar_orcamento`, `scroll_75`. Não criar outros sem atualizar `docs/GTM.md`.
4. Todo script de terceiros é condicionado a uma variável de ambiente, vazia por padrão: `PUBLIC_GOOGLE_ADS_ID` (Google Ads, hoje o único ativo, ver `docs/TRACKING.md`), `PUBLIC_GTM_ID` (GTM, desligado) e `PUBLIC_CF_ANALYTICS_TOKEN` (Cloudflare Analytics, sem cookie). Variável vazia significa nenhum script externo na página. GA4 e Meta Pixel, se um dia entrarem, vão dentro do GTM, nunca soltos no código. Não ligar GTM e Google Ads ao mesmo tempo: a conversão contaria em dobro.
5. Página de região só é gerada se `publicada: true` em `src/data/regioes.json`. Sem `paragrafoUnico`, a página sai com `noindex` e o build avisa.
6. Marcas de loja (Mobly, MadeiraMadeira, Amazon, Magalu, Tok&Stok, Leroy Merlin) só no corpo do texto. Nunca em title, H1, URL ou anúncio.
7. Uma única imagem OG padrão em `public/og.png`. Páginas de serviço e região podem sobrescrever.
8. URLs: minúsculas, hifens, sem acento, barra final. Canonical em todas as páginas.
9. **Nunca exibir preço em reais.** Todo CTA de valor leva ao WhatsApp. `/orcamento/` explica a cotação sem citar números.
10. **Nunca prometer garantia.** Nada de "garantia", "90 dias", "voltamos sem custo", "asseguramos" ou equivalente com outro nome. É marketplace e não assume responsabilidade por serviço de terceiro. `site.prometerGarantia` é `false` e o build falha se o termo aparecer.
11. **Nunca prometer prazo de resposta nem atendimento no mesmo dia.** O orçamento volta depois da consulta aos fornecedores, sem prazo divulgado. `site.prometerPrazoResposta` é `false`. Dizer quanto dura a montagem (campo `tempoMedio`) é permitido: isso é execução, não resposta.
12. **Nunca citar forma de pagamento.** Nada de Pix, cartão, maquininha, dinheiro, parcelamento ou adiantamento. Isso é combinado na conversa. `site.exibirFormaDePagamento` é `false`.
13. **Sem e-mail nesta fase.** `site.temEmail` é `false`; nenhum componente renderiza e-mail enquanto for `false`.
14. **Sem CNPJ nesta fase.** `site.temCnpj` é `false`; nenhum texto, FAQ ou dado estruturado pode mencionar "nota fiscal". Ao virar `true`, procurar os comentários `// NOTA FISCAL: liberar aqui`.
15. **Formulário desligado.** `site.formularioAtivo` é `false`: onde havia formulário, o site mostra um bloco de WhatsApp. O código do formulário e o backend estão prontos e testados. Virar `true` religa tudo.
16. **Blog sem data.** Conteúdo perene. O frontmatter não tem `pubDate` nem `updatedDate`, a ordem vem do campo `ordem`, e o JSON-LD `Article` sai sem `datePublished`. O build falha se aparecer campo de data.
17. **Sem fotos reais de clientes.** As imagens de `public/img/` são fotos genéricas de banco ou geradas por IA. Nenhuma legenda pode dizer "nosso cliente" ou "serviço realizado por nós". Nomes de arquivo em `docs/FOTOS.md`.
18. **Nenhum segredo no repositório.** Senha do painel, usuário e salt do Worker entram por `wrangler secret put`. Nunca em `wrangler.toml`, `.env` ou commit.
19. **Deploy só por Cloudflare Pages.** O GitHub guarda o código; o build roda no Cloudflare. Nunca criar `.github/workflows/`, `vercel.json`, `netlify.toml` nem script de deploy manual no `package.json`.
20. **Site 100% estático.** Nada de `@astrojs/cloudflare`, `output: "server"`, adapter, pasta `functions/` ou `wrangler.toml` na raiz. Se aparecer rota dinâmica, aí sim se adiciona adapter e `output: "server"` juntos.
21. **Cabeçalhos e redirecionamentos** ficam em `public/_headers` e `public/_redirects`, no formato do Cloudflare Pages. Não inventar formato próprio. `_redirects` só para migração e canonical, nunca para rota que já existe.
22. **Preview de branch nunca é indexado.** `src/lib/deploy.ts` lê `CF_PAGES_BRANCH`: qualquer branch fora de `main` sai com `noindex` e `robots.txt` bloqueando tudo. Não fazer push de teste em `main`.
23. **Nenhum caminho `.pages.dev` no código.** Todo link canônico sai de `site` no `astro.config.mjs`.

## Estilo de texto

- Português do Brasil, direto, frases curtas, "você".
- Proibido: travessão, "soluções", "experiência incrível", "transformar", "seja qual for", listas de três adjetivos, parágrafos começando com "Além disso", excesso de exclamação.
- Números concretos onde forem verdadeiros: tempo médio de montagem, horário de atendimento.
- Citar móveis planejados sempre que couber: é o serviço de maior valor.

## SEO

- Um H1 por página. Title até 60 caracteres, description até 155.
- JSON-LD: LocalBusiness em todo o site; Service em serviço e região; FAQPage onde houver FAQ; BreadcrumbList em páginas internas; Article no blog.
- Links internos: serviço linka 6 regiões prioridade 1; região linka todos os serviços e 4 vizinhas; rodapé lista 8 regiões e 10 serviços.
- `sitemap.xml` exclui `noindex`. `robots.txt` aponta para o sitemap.

## Como publicar uma região

Ver `docs/PUBLICAR_REGIAO.md`.

## Como ligar o tracking

Ver `docs/GTM.md`.

## Como ligar o formulário e o banco

Ver `docs/BACKEND.md`.

## Não fazer

- Não adicionar dependências de UI (React, shadcn, sliders, animações).
- Não criar página de região sem parágrafo único.
- Não inventar depoimentos, números de clientes ou avaliações.
- Não usar `localStorage` para dados de lead. UTMs vão em `sessionStorage`.
- Não commitar `worker/node_modules`, `.dev.vars` nem qualquer segredo.
