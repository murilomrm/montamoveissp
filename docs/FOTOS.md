# Fotos do site

Todas as imagens vêm de geração por IA fotorrealista. Os prompts e os nomes de arquivo estão em `PROMPT_NANO_BANANA_FOTOS.md` (raiz do projeto). Este arquivo só diz onde cada imagem entra.

## Como colocar

1. Gere a imagem com o prompt do arquivo de prompts.
2. Redimensione para a largura abaixo e salve em WebP (qualidade 80). JPG também funciona.
3. Salve em `public/img/` com o nome exato (sem espaço, sem maiúscula). O componente `Foto.astro` procura `.webp`, `.avif`, `.jpg`, `.jpeg` e `.png`, nessa ordem.
4. Rode `npm run build`. Sem o arquivo, sai um bloco cinza com a proporção certa. Com o arquivo, sai a imagem com `width`, `height` e `loading="lazy"`.

Não use legenda que afirme "nosso cliente" ou "serviço realizado por nós" enquanto as imagens forem geradas.

## Onde cada imagem entra

| Arquivo | Onde | Largura x altura recomendada |
|---|---|---|
| `hero` | Home, topo (carrega sem lazy) | 1280 x 720 |
| `montador-1` | `/sobre/` | 1200 x 900 |
| `montador-2` | Serviço `montagem-de-cozinha` | 1200 x 900 |
| `antes-depois-1-depois` | Serviço `montagem-de-guarda-roupa` | 1200 x 900 |
| `escritorio-montagem` | Serviço `montagem-de-moveis-de-escritorio` | 1200 x 900 |
| `cama-montagem` | Serviço `montagem-de-cama` | 1200 x 900 |
| `ferramentas` | Serviço `instalacao-de-prateleiras-e-suportes` | 1200 x 900 |
| `whatsapp-atendimento` | `/orcamento/` | 1200 x 900 |
| `regiao-predio-sp` | Todas as páginas de região | 1280 x 720 |
| `antes-depois-1-antes`, `antes-depois-2-antes`, `antes-depois-2-depois` | Reservadas para uma seção antes/depois futura. Não entram no layout atual | 1200 x 900 |
| `og-image` | Substitui `public/og.png` (1200 x 630). Renomeie para `og.png` | 1200 x 630 |
| `favicon-base` | Base para `public/favicon.svg` e `public/apple-touch-icon.png` | 512 x 512 |

Para trocar a imagem de um serviço, edite o campo `imagem` em `src/data/servicos.ts`.
