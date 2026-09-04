# Google Tag Manager

Nenhum pixel entra no código. Tudo (GA4, Meta Pixel, Google Ads) é configurado dentro do GTM. O site só carrega o GTM se `PUBLIC_GTM_ID` estiver preenchido e o visitante aceitar os cookies.

## Ligar

1. Crie o contêiner Web no GTM e copie o ID (`GTM-XXXXXXX`).
2. No GitHub: Settings > Secrets and variables > Actions > Variables > New repository variable: `PUBLIC_GTM_ID` = `GTM-XXXXXXX`. Local: coloque em `.env`.
3. Faça um push (ou rode o workflow manualmente). O banner de cookies passa a aparecer.

## Consent Mode v2

O site chama `gtag('consent','default', denied)` antes do GTM e `gtag('consent','update', granted)` quando o visitante aceita. Com recusa, o GTM nem carrega. No GTM, deixe as tags Google com "Consent Settings" no padrão (elas já obedecem ao consent). Para o Meta Pixel, adicione a exigência de `ad_storage` em "Additional consent checks".

## Eventos do dataLayer

| Evento | Quando | Parâmetros |
|---|---|---|
| `clique_whatsapp` | clique em qualquer link ou botão de WhatsApp | `origem` (flutuante, hero, card, rodape, formulario, cabecalho, cta), `pagina`, `servico`, `regiao` |
| `gerar_lead` | envio válido do formulário, antes de abrir o WhatsApp | `servico`, `regiao`, `pagina`, `tem_data` |
| `clique_telefone` | clique em link `tel:` | `pagina` |
| `visualizar_orcamento` | ao entrar em `/orcamento/` | `pagina` |
| `scroll_75` | 75% de rolagem em página de serviço ou região | `pagina`, `tipo_pagina` |

Não crie outros eventos no código sem atualizar esta tabela.

## Variáveis no GTM

Crie variáveis do tipo "Data Layer Variable" para: `origem`, `pagina`, `servico`, `regiao`, `tem_data`, `tipo_pagina`.

## Gatilhos

Um gatilho "Custom Event" para cada evento acima, com o nome exato do evento.

## Tags

### GA4

1. Tag "Google Tag" com o Measurement ID (`G-XXXXXXX`), gatilho "Initialization - All Pages".
2. Uma tag "GA4 Event" por evento da tabela, com o mesmo nome de evento e os parâmetros como "Event Parameters" usando as variáveis acima.
3. No GA4, marque `gerar_lead` e `clique_whatsapp` como conversão (key event).

### Google Ads

1. Tag "Google Ads Conversion Tracking" com Conversion ID e Label da conversão "Lead".
2. Gatilho: `gerar_lead`. Opcional: segunda conversão para `clique_whatsapp` com origem `flutuante` ou `hero`.
3. Ative "Enhanced Conversions" só se um dia houver e-mail no formulário. Hoje não há.

### Meta Pixel

1. Tag "Custom HTML" com o snippet base do pixel, gatilho "All Pages", exigindo consentimento `ad_storage`.
2. Tag "Custom HTML" com `fbq('track','Lead')`, gatilho `gerar_lead`.
3. Tag "Custom HTML" com `fbq('track','Contact')`, gatilho `clique_whatsapp`.

## Testar

1. GTM Preview (Tag Assistant) apontando para o site.
2. Aceite os cookies, clique no botão de WhatsApp, envie o formulário. Confira os eventos na aba Data Layer.
3. Meta Pixel Helper (extensão) para ver o pixel disparando.
4. Recuse os cookies em uma janela anônima e confirme que nenhuma requisição para googletagmanager.com aparece na aba Network.
