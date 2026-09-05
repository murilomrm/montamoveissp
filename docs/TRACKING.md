# Tracking

Nesta fase o site tem **só o Google Ads**, instalado direto no código, sem GTM. Nada de GA4, Meta Pixel ou qualquer outro script de terceiros.

## O que está configurado

| Item | Valor |
|---|---|
| ID da tag | `AW-18433016209` |
| Rótulo da conversão | `38zmCKnBqu8cEJGDxtVE` |
| `send_to` montado | `AW-18433016209/38zmCKnBqu8cEJGDxtVE` |
| Quando dispara | Todo clique em botão ou link de WhatsApp, e o envio do formulário |

Os dois valores vivem em variáveis de ambiente. Nenhum deles está escrito no código.

## Onde colar as variáveis no Cloudflare

Painel do Cloudflare > **Workers & Pages** > projeto do site > **Settings** > **Variables and Secrets** (em projetos mais antigos aparece como *Environment variables*).

Adicione as duas, com escopo **Production**, e repita em **Preview** só se quiser medir conversão nas branches de teste (normalmente não quer):

```
PUBLIC_GOOGLE_ADS_ID                 = AW-18433016209
PUBLIC_GOOGLE_ADS_CONVERSION_LABEL   = 38zmCKnBqu8cEJGDxtVE
```

Deixe como *Text*, não como *Secret*: elas precisam entrar no HTML servido ao visitante, e o prefixo `PUBLIC_` do Astro já indica isso. Não há segredo aqui, o ID da tag é visível no código-fonte de qualquer site que anuncia.

Depois de salvar, rode um novo deploy (**Deployments** > último deploy > *Retry deployment*), porque as variáveis são lidas no momento do build.

## Como funciona no código

| Arquivo | Papel |
|---|---|
| `src/components/GoogleAds.astro` | Injeta `gtag.js` no `<head>`. Só renderiza com `PUBLIC_GOOGLE_ADS_ID` preenchida |
| `src/layouts/Base.astro` | Inclui o componente em todas as páginas |
| `src/lib/tracking.ts` | `dispararConversaoGoogleAds()` e a lista `EVENTOS_DE_CONVERSAO` |

A conversão está dentro da função `track()`. Todo evento `clique_whatsapp` ou `gerar_lead` dispara o push no `dataLayer` **e** a conversão do Ads. Como todo botão de WhatsApp do site passa por `track()`, a cobertura é automática: botão flutuante, hero, cards de serviço, cabeçalho, rodapé, CTA final, páginas de região e formulário. Nenhum componente precisou ser alterado.

Se a tag não carregar, por bloqueador de anúncio ou rede lenta, a função sai sem fazer nada. O site não quebra e o console fica limpo.

## Testar

1. Abra o site em uma aba anônima com as variáveis já publicadas.
2. Ferramentas do desenvolvedor > aba Network, filtre por `googleads` ou `collect`.
3. Clique em qualquer botão verde de WhatsApp.
4. Deve sair uma requisição para `googleadservices.com/pagead/conversion` ou `google.com/pagead`.
5. No painel do Google Ads, a conversão aparece em **Metas > Conversões**. O primeiro registro costuma levar de 3 a 24 horas.

A extensão **Google Tag Assistant** confirma a tag e o disparo em tempo real, e é o jeito mais rápido de validar.

## Eventos no dataLayer

Continuam existindo, independentes do Ads. Se um dia entrar GTM, ele lê estes eventos sem mudança de código.

| Evento | Quando | Parâmetros | Conta como conversão |
|---|---|---|---|
| `clique_whatsapp` | clique em botão ou link de WhatsApp | `origem`, `pagina`, `servico`, `regiao` | sim |
| `gerar_lead` | envio válido do formulário | `servico`, `regiao`, `pagina`, `tem_data`, `tem_foto` | sim |
| `clique_telefone` | clique em link `tel:` | `pagina` | não |
| `visualizar_orcamento` | entrada em `/orcamento/` | `pagina` | não |
| `scroll_75` | 75% de rolagem em página de serviço ou região | `pagina`, `tipo_pagina` | não |

## Uma ressalva sobre a página Trabalhe Conosco

O formulário de cadastro de montador dispara `clique_whatsapp` com `origem: "formulario"`. Isso hoje conta como conversão no Ads, apesar de ser candidato a vaga, não cliente. O volume é baixo e a página não é anunciada, então o ruído é pequeno. Para excluir, tire o disparo em `src/pages/trabalhe-conosco.astro` ou troque o nome do evento ali.

## Se um dia entrar GTM

Esvazie `PUBLIC_GOOGLE_ADS_ID`, preencha `PUBLIC_GTM_ID` e configure a conversão do Ads dentro do contêiner, escutando o evento `gerar_lead` ou `clique_whatsapp`. O passo a passo está em `docs/GTM.md`. Não deixe os dois ligados ao mesmo tempo: a conversão contaria em dobro.
