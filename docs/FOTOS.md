# Fotos do site

O componente `src/components/Foto.astro` procura o arquivo em `public/img/` nas extensões `.webp`, `.avif`, `.jpg`, `.jpeg` e `.png`, nessa ordem. Achou, renderiza com `width`, `height` e `loading="lazy"`. Não achou, desenha um bloco cinza com a mesma proporção e o build passa igual.

Ou seja: é só salvar o arquivo com o nome exato e rodar `npm run build`. Nenhum código precisa mudar.

## Antes de salvar

1. Redimensione para a largura da tabela.
2. Converta para WebP com qualidade 80. Um comando que resolve, se você tiver o `cwebp` instalado:
   ```bash
   cwebp -q 80 -resize 1280 0 origem.jpg -o public/img/hero.webp
   ```
   Sem o `cwebp`, salvar em `.jpg` funciona igual, só pesa mais.
3. Nome do arquivo em minúsculas, com hífen, sem acento e sem espaço.

## As 13 fotos e onde cada uma entra

| Nome do arquivo | A foto | Onde aparece | Tamanho |
|---|---|---|---|
| `hero` | Homem de polo cinza ajoelhado, parafusando a lateral de um guarda-roupa; colchão e caixas ao fundo | Topo da home, carrega sem lazy | 1280 x 720 |
| `montador-retrato` | Homem de polo cinza em pé, caixa de ferramentas de metal e nível laranja nas mãos, guarda-roupa branco de correr atrás | Página `/sobre/` | 1200 x 900 |
| `whatsapp-atendimento` | Mão segurando celular com uma conversa de chat, mesa de madeira e caneca | `/orcamento/` e `/contato/` | 1200 x 675 |
| `planejado-closet` | Homem de camiseta azul escura parafusando prateleira dentro de closet branco com cabides | Todas as 44 páginas de região | 1200 x 900 |
| `rack-suspenso` | Homem de polo cinza instalando rack suspenso de madeira na parede da sala | Serviço `montagem-de-moveis` | 1200 x 900 |
| `caixas-fechadas` | Caixas de papelão planas encostadas na parede do quarto | Serviço `montagem-e-desmontagem-para-mudanca` | 1200 x 900 |
| `guarda-roupa` | Homem de polo cinza encaixando prateleira dentro de guarda-roupa de madeira clara | Serviço `montagem-de-guarda-roupa` | 1200 x 900 |
| `cozinha-armario` | Homem de polo azul-marinho fixando armário aéreo em cozinha com azulejo bege | Serviço `montagem-de-cozinha` | 1200 x 900 |
| `cozinha-planejada` | Homem de polo cinza medindo o tampo da bancada em cozinha planejada branca | Serviço `montagem-de-moveis-planejados` | 1200 x 900 |
| `escritorio-bancada` | Homem de polo cinza parafusando a bancada de madeira embaixo da janela | Serviço `montagem-de-moveis-de-escritorio` | 1200 x 900 |
| `painel-tv` | Homem de polo azul encaixando o painel de TV na sala | Serviço `montagem-de-moveis-comprados-online` | 1200 x 900 |
| `prateleiras` | Homem de camiseta cinza de costas, parafusando prateleiras suspensas | Serviço `instalacao-de-prateleiras-e-suportes` | 1200 x 900 |
| `cozinha-bancada` | Homem de polo azul com luvas nivelando o tampo sobre a ilha, janelão com prédios | Reserva, ainda não usada no layout | 1280 x 720 |

Dois serviços seguem sem foto porque não veio imagem do tema: `desmontagem-de-moveis` e `montagem-de-cama`. Eles mostram, no lugar da foto, o card com a lista de móveis do serviço. Para dar foto a eles, salve o arquivo e adicione `imagem: "nome-do-arquivo"` no serviço em `src/data/servicos.ts`.

## Imagem de compartilhamento e ícone

| Arquivo | Uso | Tamanho |
|---|---|---|
| `public/og.png` | Aparece quando alguém compartilha o link no WhatsApp, Facebook ou LinkedIn. Hoje é um cartão navy gerado por código. Substitua por arte de verdade quando tiver | 1200 x 630 |
| `public/favicon.svg` | Ícone da aba | vetor |
| `public/apple-touch-icon.png` | Ícone ao salvar na tela inicial do iPhone | 180 x 180 |

## Fotos nos artigos do blog

Cada artigo aceita uma imagem de topo, opcional. Salve o arquivo em `public/img/` e adicione a linha `imagem:` no frontmatter do `.md`:

```yaml
---
title: "Montagem de móveis planejados: como funciona"
description: "..."
ordem: 5
tags: ["planejados", "montagem"]
imagem: "blog-planejados"
---
```

A imagem aparece no topo do artigo e como miniatura na listagem `/blog/`. Formato 1200 x 675. Sem a linha `imagem`, o artigo sai sem foto e continua funcionando.

## Transparência

As fotos não retratam clientes nem serviços já realizados pela empresa. Nenhuma legenda do site afirma isso. Use legendas descritivas do tipo "Montagem de guarda-roupa de correr", nunca "nosso cliente" ou "serviço realizado por nós".
