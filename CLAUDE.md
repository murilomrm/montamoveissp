# CLAUDE.md

Site de geração de leads da MontaMóveis SP (montagem e desmontagem de móveis em São Paulo). Domínio: montamoveissp.com.br. Objetivo único: ranquear no Google para "montador de móveis + região" e converter em conversa no WhatsApp.

## Stack

- Astro (estático) + Tailwind + TypeScript. Deploy em Vercel ou Cloudflare Pages.
- Sem CMS, sem banco, sem backend obrigatório. Conteúdo vive em `src/data/` e `src/content/blog/`.
- Antes de instalar qualquer pacote: `npm view <pacote> version`. Não usar versões de memória.

## Comandos

- `npm run dev` desenvolvimento
- `npm run build` build de produção (roda `scripts/check-seo.ts` antes; build falha se title > 60, description > 155 ou depoimento placeholder em produção)
- `npm run preview` pré-visualização do build
- `npm run check` `astro check` + typescript

## Regras que não mudam

1. Todo dado da empresa (WhatsApp, horário) vem de `src/data/site.ts`. Nunca hardcoded em componente.
2. Todo link de WhatsApp passa por `src/lib/whatsapp.ts` (monta `wa.me` com mensagem contextual e dispara `clique_whatsapp`). Número atual: `+55 11 94080 3902` (pessoal, até completar 10 clientes; depois troca para chip dedicado, só mudar `site.ts`).
3. Todo evento de tracking passa por `src/lib/tracking.ts` (push no `window.dataLayer`). Nomes de evento: `clique_whatsapp`, `gerar_lead`, `clique_telefone`, `scroll_75`. Não criar outros sem atualizar `docs/GTM.md`.
4. Nenhum script de terceiros carrega se `PUBLIC_GTM_ID` estiver vazio. GA4, Meta Pixel e Google Ads são configurados dentro do GTM, nunca no código.
5. Página de região só é gerada se `publicada: true` em `src/data/regioes.json`. Sem `paragrafoUnico`, a página sai com `noindex` e o build avisa.
6. Marcas de loja (Mobly, MadeiraMadeira, Amazon, Magalu, Tok&Stok, Leroy Merlin) só no corpo do texto. Nunca em title, H1, URL ou anúncio.
7. Uma única imagem OG padrão em `public/og.png`. Páginas de serviço e região podem sobrescrever.
8. URLs: minúsculas, hífens, sem acento, barra final. Canonical em todas as páginas.
9. **Nunca exibir preço em reais em nenhuma página.** Todo CTA relacionado a valor leva ao WhatsApp. A página `/orcamento/` explica o processo de cotação sem citar números.
10. **Sem e-mail nesta fase.** `site.temEmail` é `false`; nenhum componente deve renderizar e-mail enquanto for `false`.
11. **Sem CNPJ nesta fase.** `site.temCnpj` é `false`; nenhum texto, FAQ ou dado estruturado pode mencionar "nota fiscal" enquanto for `false`. Ao virar `true`, procurar os comentários `// NOTA FISCAL: liberar aqui` no código.
12. **Sem fotos reais.** Todas as imagens de `public/img/` vêm de geração por IA fotorrealista, seguindo `PROMPT_NANO_BANANA_FOTOS.md`. Usar exatamente os nomes de arquivo definidos ali.
13. Deploy via GitHub Pages, com workflow do GitHub Actions.

## Estilo de texto

- Português do Brasil, direto, frases curtas, "você".
- Proibido: travessão, "soluções", "experiência incrível", "transformar", "seja qual for", listas de três adjetivos, parágrafos começando com "Além disso", excesso de exclamação.
- Números concretos (90 dias de garantia, orçamento em 5 minutos, horário exato).

## SEO

- Um H1 por página. Title até 60 caracteres, description até 155.
- JSON-LD: LocalBusiness em todo o site; Service em serviço e região; FAQPage onde houver FAQ; BreadcrumbList em páginas internas; Article no blog.
- Links internos: serviço linka 6 regiões prioridade 1; região linka todos os serviços e 4 vizinhas; rodapé lista 8 regiões e 10 serviços.
- `sitemap.xml` exclui `noindex`. `robots.txt` aponta para o sitemap.

## Como publicar uma região

1. Em `src/data/regioes.json`, preencher `paragrafoUnico` (60 a 120 palavras, algo real sobre o lugar: prédios, portaria, elevador, estacionamento, perfil dos móveis mais comuns).
2. Marcar `publicada: true`.
3. `npm run build` e conferir que a região aparece no `sitemap.xml`.

## Como ligar o tracking

1. Preencher `PUBLIC_GTM_ID` no painel da Vercel (ou `.env` local).
2. Redeploy.
3. Seguir `docs/GTM.md` para criar tags GA4, Meta Pixel e conversão do Google Ads escutando os eventos do dataLayer.
4. Testar com Tag Assistant e Meta Pixel Helper.

## Não fazer

- Não adicionar dependências de UI (React, shadcn, sliders, animações).
- Não criar página de região sem parágrafo único.
- Não inventar depoimentos, números de clientes ou avaliações.
- Não usar `localStorage` para dados de lead. UTMs vão em `sessionStorage`.
