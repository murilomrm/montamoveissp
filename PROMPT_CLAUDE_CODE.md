# PROMPT PARA O CLAUDE CODE

> **Documento histórico.** Este é o briefing original do projeto, mantido como registro. Várias decisões mudaram depois: o deploy é Cloudflare Pages (não GitHub Pages nem Vercel), não existe `vercel.json`, o site não promete garantia, prazo de resposta nem forma de pagamento, o formulário está desligado e o blog não tem data. **As regras vigentes estão em `CLAUDE.md` e no `README.md`.** Em caso de conflito, valem aqueles, não este arquivo.

Como usar:
1. Crie a pasta do projeto e coloque dentro dela o arquivo `CLAUDE.md` (entregue junto).
2. Abra o Claude Code na pasta e cole tudo que está abaixo da linha.
3. Antes de rodar, troque os campos entre colchetes se já tiver os dados. Se não tiver, deixe: o código usa placeholders e você preenche depois em `src/data/site.ts`.

---

Você vai construir do zero o site de uma empresa de montagem e desmontagem de móveis em São Paulo chamada **MontaMóveis SP**, domínio `montamoveissp.com.br`. O objetivo do site é um só: gerar lead no WhatsApp. Ele precisa ranquear no Google para buscas do tipo "montador de móveis [bairro/zona/cidade]" e converter no celular. Nada de recursos supérfluos. Referência de simplicidade que converte: um site institucional de uma página com serviços, região atendida, diferenciais e botão de WhatsApp em toda seção.

**Aviso sobre imagens**: as fotos reais de serviços ainda não existem. As imagens do site serão geradas em uma sessão separada de geração de imagem (Nano Banana), usando os prompts do arquivo `PROMPT_NANO_BANANA_FOTOS.md`, que já está pronto no projeto. Trabalhe com placeholders nos nomes de arquivo exatos definidos naquele documento; não peça para gerar imagens você mesmo e não use bancos de imagem de terceiros.

**Decisões já fechadas nesta fase** (não repropor, só implementar): sem preço exibido em nenhuma página, WhatsApp `+55 11 94080 3902` como único canal de conversão, sem e-mail, sem CNPJ ainda (logo sem menção a nota fiscal), sem fotos reais, deploy em GitHub Pages.

## 1. Stack e regras técnicas

| Item | Decisão |
|---|---|
| Framework | Astro (última versão estável) com output estático |
| Estilo | Tailwind CSS. Sem biblioteca de componentes pesada |
| Linguagem | TypeScript |
| Conteúdo | Arquivos em `src/data/` (TS e JSON). Zero CMS |
| Deploy | GitHub Pages (repositório público ou privado com Pages habilitado). Incluir workflow do GitHub Actions (`.github/workflows/deploy.yml`) que builda o Astro e publica em Pages a cada push na branch principal |
| Imagens | `astro:assets` com WebP/AVIF, lazy loading, width e height explícitos |
| Fontes | Uma fonte variável self-hosted (Inter ou Poppins). Sem Google Fonts externo |
| JS no cliente | Mínimo. Só o formulário, o menu mobile e o dataLayer |
| Performance | Meta Lighthouse mobile: 95+ em Performance, SEO e Acessibilidade |
| Node | Fixar versão em `.nvmrc` e `package.json` engines |

Comece verificando as versões atuais das dependências com `npm view` antes de instalar. Não use versões de memória.

## 2. Estrutura de dados

Crie `src/data/site.ts` com um objeto único e tipado. Tudo que é dado da empresa vem daqui e nunca fica hardcoded em componente:

```ts
export const site = {
  nome: "MontaMóveis SP",
  dominio: "https://www.montamoveissp.com.br",
  whatsapp: "5511940803902", // número pessoal por enquanto, trocar por chip dedicado ao completar 10 clientes
  telefoneExibicao: "(11) 94080-3902",
  temEmail: false, // sem e-mail nesta fase. Nenhum componente deve exibir e-mail enquanto for false
  temCnpj: false, // vira true quando o MEI for aberto. Enquanto false, nenhum texto pode mencionar nota fiscal
  cnpj: "",
  razaoSocial: "",
  enderecoBase: { cidade: "São Paulo", uf: "SP" },
  horario: "Seg a Sex 7h às 20h, Sáb 8h às 18h",
  garantiaDias: 90,
  tempoOrcamento: "5 minutos",
  instagram: "[url]",
  mensagemWhatsappPadrao: "Olá! Quero um orçamento de montagem de móveis.",
  exibirPrecoNoSite: false, // regra fixa do projeto: nunca true. Todo CTA de preço leva ao WhatsApp
}
```

Regra explícita: **nenhuma página do site exibe valor em reais**. Onde antes se pensava em tabela de preços, existe a página `/orcamento/`, que explica como funciona a cotação (mensagem no WhatsApp, resposta com valor combinado antes de fechar) sem citar nenhum número. Todo bloco que hoje diria "a partir de R$ X" vira "Peça o valor no WhatsApp".

Enquanto `temCnpj` for `false`, nenhum texto do site, do FAQ ou dos dados estruturados pode mencionar "nota fiscal". Quando o MEI for aberto, mudar para `true` e adicionar o texto nos lugares indicados com o comentário `// NOTA FISCAL: liberar aqui quando temCnpj = true`.

Crie `src/data/servicos.ts` com os serviços abaixo. Cada serviço tem: slug, nome, nomeCurto, tituloSEO, h1, metaDescription, palavraChave, resumo (1 frase), descricaoLonga (4 a 6 parágrafos curtos, tom direto, sem enrolação), oQueIncluso (lista), naoIncluso (lista), tempoMedio, faq (5 perguntas com respostas de 2 a 3 frases), moveisExemplo (lista).

| Slug | Serviço |
|---|---|
| montagem-de-moveis | Montagem de móveis |
| desmontagem-de-moveis | Desmontagem de móveis |
| montagem-e-desmontagem-para-mudanca | Montagem e desmontagem para mudança |
| montagem-de-guarda-roupa | Montagem de guarda-roupa |
| montagem-de-cozinha | Montagem de cozinha e armários |
| montagem-de-moveis-planejados | Montagem de móveis planejados |
| montagem-de-moveis-de-escritorio | Montagem de móveis de escritório (empresas) |
| montagem-de-cama | Montagem de cama box, beliche e berço |
| montagem-de-moveis-comprados-online | Montagem de móveis comprados online (citar Mobly, MadeiraMadeira, Amazon, Magalu, Tok&Stok, Leroy Merlin apenas no corpo do texto, nunca em title ou H1) |
| instalacao-de-prateleiras-e-suportes | Instalação de prateleiras, painéis e suporte de TV |

Crie `src/data/regioes.json` com a lista abaixo (importar da planilha do projeto, aba 05). Cada região tem: slug, nome, macroRegiao (Capital, ABC ou Grande SP), prioridade (1 a 3), bairrosVizinhos (array), paragrafoUnico (string, pode vir vazio), publicada (boolean). Regras: só gerar página se `publicada: true`; se `paragrafoUnico` estiver vazio, gerar a página com `noindex` e avisar no console do build listando quais regiões estão sem texto.

Lista inicial (slug, nome, macro, prioridade):

zona-sul Zona Sul Capital 1; zona-oeste Zona Oeste Capital 1; zona-norte Zona Norte Capital 1; zona-leste Zona Leste Capital 1; centro Centro Capital 2; moema Moema Capital 1; vila-mariana Vila Mariana Capital 1; saude Saúde Capital 2; campo-belo Campo Belo Capital 2; brooklin Brooklin Capital 2; santo-amaro Santo Amaro Capital 2; jabaquara Jabaquara Capital 2; morumbi Morumbi Capital 2; itaim-bibi Itaim Bibi Capital 1; vila-olimpia Vila Olímpia Capital 2; ipiranga Ipiranga Capital 2; interlagos Interlagos Capital 3; pinheiros Pinheiros Capital 1; vila-madalena Vila Madalena Capital 2; perdizes Perdizes Capital 1; lapa Lapa Capital 2; butanta Butantã Capital 2; vila-leopoldina Vila Leopoldina Capital 2; santana Santana Capital 1; tucuruvi Tucuruvi Capital 2; casa-verde Casa Verde Capital 3; freguesia-do-o Freguesia do Ó Capital 3; pirituba Pirituba Capital 3; tatuape Tatuapé Capital 1; mooca Mooca Capital 1; vila-prudente Vila Prudente Capital 2; penha Penha Capital 2; analia-franco Anália Franco Capital 2; itaquera Itaquera Capital 2; vila-formosa Vila Formosa Capital 3; sao-miguel-paulista São Miguel Paulista Capital 3; higienopolis Higienópolis Capital 2; bela-vista Bela Vista Capital 2; aclimacao Aclimação Capital 3; jardins Jardins Capital 1; abc ABC Paulista ABC 1; santo-andre Santo André ABC 1; sao-bernardo-do-campo São Bernardo do Campo ABC 1; sao-caetano-do-sul São Caetano do Sul ABC 2; diadema Diadema ABC 2; maua Mauá ABC 3; guarulhos Guarulhos GrandeSP 1; osasco Osasco GrandeSP 1; barueri Barueri GrandeSP 2; alphaville Alphaville GrandeSP 1; taboao-da-serra Taboão da Serra GrandeSP 2; carapicuiba Carapicuíba GrandeSP 3; cotia Cotia GrandeSP 2; santana-de-parnaiba Santana de Parnaíba GrandeSP 3; mogi-das-cruzes Mogi das Cruzes GrandeSP 3; suzano Suzano GrandeSP 3; itaquaquecetuba Itaquaquecetuba GrandeSP 3; embu-das-artes Embu das Artes GrandeSP 3; ferraz-de-vasconcelos Ferraz de Vasconcelos GrandeSP 3; poa Poá GrandeSP 3.

Crie `src/data/depoimentos.ts` com 6 depoimentos placeholder marcados claramente como `placeholder: true` (o build deve falhar se `placeholder: true` existir e a variável `ALLOW_PLACEHOLDERS` não estiver definida). Nunca inventar avaliações reais.

Crie `src/data/faq.ts` com 10 perguntas gerais (região, como funciona a cotação, garantia, forma de pagamento, prazo, móvel sem manual, móvel usado, ferramentas, cancelamento, se emite nota fiscal (responder de forma condicional a `site.temCnpj`)).

## 3. Páginas e URLs

| URL | Tipo | Observações |
|---|---|---|
| `/` | Home | Hero com H1, 3 provas (orçamento em 5 min, garantia de 90 dias, montadores verificados), botão WhatsApp, lista de serviços em cards, faixa "Onde atendemos" com as regiões prioridade 1 linkadas, como funciona em 4 passos, tabela de preços "a partir de" (só se valor > 0), depoimentos, FAQ, formulário, CTA final |
| `/[slug-do-servico]/` | Serviço | Uma por serviço, gerada de `servicos.ts`. Conteúdo longo, FAQ, lista de móveis, links para regiões |
| `/montador-de-moveis/[slug]/` | Região | Uma por região publicada. Title "Montador de Móveis em {nome}". Conteúdo: parágrafo único + bloco padrão de serviços + bairros vizinhos citados em texto + FAQ com a região no texto + regiões próximas linkadas. Nunca duplicar texto entre regiões além do bloco padrão |
| `/montador-de-moveis/` | Hub de regiões | Lista todas as regiões agrupadas por macro região |
| `/orcamento/` | Como funciona | Explica o processo de cotação (fotos ou lista de móveis pelo WhatsApp, resposta com valor combinado, sem tabela fixa). Nenhum valor em reais nesta página |
| `/sobre/` | Institucional | Empresa, CNPJ, como selecionamos montadores |
| `/contato/` | Contato | Formulário, WhatsApp, e-mail, horário |
| `/trabalhe-conosco/` | Recrutamento | Formulário separado para montadores (nome, região, experiência, ferramentas, veículo). Página com `noindex`? Não: indexar, ela atrai montadores |
| `/blog/` e `/blog/[slug]/` | Blog | Content collection em Markdown. Criar 3 artigos iniciais: "Quanto custa montador de móveis em São Paulo (2026)", "Como escolher um montador de móveis sem dor de cabeça", "Checklist de desmontagem e montagem de móveis para mudança" |
| `/politica-de-privacidade/` | Legal | Use o texto já pronto em `POLITICA_DE_PRIVACIDADE.md` (raiz do projeto), convertendo o Markdown para os componentes da página. Não reescreva o conteúdo, só formate |
| `/obrigado/` | Pós-lead | Página de agradecimento com `noindex`, usada como confirmação de conversão |
| `/404` | Erro | Com busca por região e botão WhatsApp |

Regras de URL: minúsculas, hífens, barra final, sem acentos. Canonical em todas. Redirect 301 de `montamoveissp.com.br` para `www.montamoveissp.com.br` (ou o contrário, escolha um e mantenha).

## 4. SEO técnico (obrigatório)

- Componente `<SEO />` que recebe title, description, canonical, ogImage, noindex e tipo de schema.
- Title com no máximo 60 caracteres, meta description com no máximo 155. Adicione um teste no build que falha se passar do limite.
- `sitemap.xml` gerado, com `lastmod`, excluindo `noindex`. `robots.txt` apontando para o sitemap.
- Dados estruturados JSON-LD:
  - Em todo o site: `LocalBusiness` (tipo `HomeAndConstructionBusiness`) com nome, telefone, url, areaServed (lista de cidades), openingHoursSpecification, priceRange, sameAs.
  - Em página de serviço: `Service` com `provider` apontando para o LocalBusiness, `areaServed`, `offers` se houver preço.
  - Em página de região: `Service` com `areaServed` igual à região + `BreadcrumbList`.
  - Em toda página com FAQ: `FAQPage`.
  - Em artigos: `Article`.
- Breadcrumb visível e com schema.
- Links internos: toda página de serviço linka para 6 regiões prioridade 1; toda página de região linka para todos os serviços e para 4 regiões vizinhas. Rodapé lista as 8 regiões principais e os 10 serviços.
- Headings em ordem (um H1 por página).
- `lang="pt-BR"`, Open Graph e Twitter Card em todas as páginas, imagem OG padrão 1200x630 em `public/og.png` (placeholder até eu entregar a arte).
- Nenhum texto importante dentro de imagem.

## 5. Conversão (WhatsApp e formulário)

- Botão flutuante de WhatsApp em todas as páginas, canto inferior direito, com texto "Orçamento" visível no desktop e só ícone no mobile. Não pode cobrir o botão do formulário.
- Todo link de WhatsApp usa `https://wa.me/{numero}?text={mensagem codificada}`. A mensagem inclui o contexto: serviço e região da página em que o clique aconteceu. Exemplo: "Olá! Quero orçamento de montagem de guarda-roupa em Moema."
- Formulário (componente único reutilizado na home, contato, serviço e região):
  - Campos: nome, WhatsApp (máscara brasileira), região ou bairro (input com sugestões de `regioes.json`), tipo de serviço (select com os serviços), lista de móveis (textarea), data desejada (opcional).
  - Sem backend obrigatório. No envio: valida, dispara `gerar_lead` no dataLayer, monta a mensagem e abre `wa.me` em nova aba. Depois redireciona para `/obrigado/`.
  - Se `PUBLIC_LEAD_WEBHOOK_URL` estiver definida, envia também um POST JSON com os campos e `pagina`, `utm_*` capturados da URL (guardar UTMs em sessionStorage na primeira visita). Incluir em `docs/` um script pronto de Google Apps Script que recebe esse POST e grava numa planilha Google.
  - Honeypot e limite de 1 envio a cada 30 segundos. Sem captcha.
- Link `tel:` visível no cabeçalho no mobile.
- Aviso curto abaixo do formulário: "Você será direcionado ao WhatsApp. Não compartilhamos seus dados." com link para a política.

## 6. Tracking preparado, mas desligado

Eu ainda não vou instalar pixels. Deixe tudo pronto para ligar depois sem mexer em código:

- Variáveis em `.env.example`: `PUBLIC_GTM_ID=`, `PUBLIC_LEAD_WEBHOOK_URL=`, `PUBLIC_SITE_URL=https://www.montamoveissp.com.br`.
- Componente `<Tracking />` no layout: se `PUBLIC_GTM_ID` estiver vazio, não renderiza nada (nenhum script externo pode ser carregado). Se estiver preenchido, injeta o snippet do GTM no `<head>` e o `<noscript>` no `<body>`.
- GA4, Meta Pixel e Google Ads serão configurados dentro do GTM, não no código. Documente isso no README com o passo a passo de cada tag e gatilho.
- `window.dataLayer` sempre existe (mesmo sem GTM) e o site dispara estes eventos com estes parâmetros:

| Evento | Quando | Parâmetros |
|---|---|---|
| `clique_whatsapp` | clique em qualquer link ou botão de WhatsApp | `origem` (flutuante, hero, card, rodapé, formulário), `pagina`, `servico`, `regiao` |
| `gerar_lead` | envio válido do formulário, antes de abrir o WhatsApp | `servico`, `regiao`, `pagina`, `tem_data` |
| `clique_telefone` | clique em link `tel:` | `pagina` |
| `visualizar_orcamento` | ao entrar em `/orcamento/` | `pagina` |
| `scroll_75` | 75% de rolagem em página de serviço ou região | `pagina`, `tipo_pagina` |

- Banner de cookies simples (aceitar/recusar) que só aparece quando `PUBLIC_GTM_ID` estiver preenchido. Guardar escolha em cookie de 6 meses. Com recusa, GTM não carrega. Use Consent Mode v2 (`default` denied, `update` granted) para o Google.

## 7. Design

- Mobile first. Cabeçalho fixo com logo, telefone e botão WhatsApp. Menu hambúrguer no mobile.
- Paleta em `tailwind.config`: primária navy `#1F3A5F`, ação laranja `#F28C28`, fundo `#FFFFFF`, cinza texto `#1F2937`, cinza claro `#F3F4F6`. Botões de WhatsApp em verde `#25D366`.
- Tipografia grande e legível. Botões com no mínimo 48px de altura. Contraste AA.
- Fotos: **não haverá fotos reais no lançamento**. As imagens de `public/img/` serão geradas separadamente por IA (Nano Banana), em formato fotorrealista, seguindo o arquivo `PROMPT_NANO_BANANA_FOTOS.md` que já existe no projeto. Use exatamente os nomes de arquivo definidos naquele documento (hero.jpg, montador-1.jpg, antes-depois-1-antes.jpg etc.) para que as imagens geradas encaixem sem renomear nada. Gere um `docs/FOTOS.md` que apenas referencia esse arquivo e lista onde cada imagem entra no layout. Quando essas imagens ainda não existirem no disco durante o desenvolvimento, use um bloco cinza sólido com as proporções corretas como placeholder temporário, nunca uma imagem de banco de imagens genérica.
- Sem animações além de transições de 150ms. Sem carrossel. Sem vídeo de fundo.

## 8. Textos

- Português do Brasil, tom direto, frases curtas, segunda pessoa ("você"). Falar como quem já montou mil guarda-roupas.
- Proibido: travessão, ponto de exclamação em excesso, "soluções", "experiência incrível", "transformar", "não importa se", "seja qual for", listas de três adjetivos, parágrafos que começam com "Além disso".
- Cada página de serviço precisa de conteúdo real e útil (o que é, como funciona, quanto tempo leva, o que o cliente precisa deixar pronto, erros comuns), não texto de enchimento.
- Números concretos sempre que possível (tempo médio, garantia em dias, horário).

## 9. Entregáveis e organização

```
/
  CLAUDE.md
  README.md              (setup, deploy, como ligar GTM, como publicar região, como criar artigo)
  .env.example
  .nvmrc
  vercel.json
  astro.config.mjs
  tailwind.config.mjs
  src/
    data/ (site.ts, servicos.ts, regioes.json, faq.ts, depoimentos.ts)
    components/ (SEO, Header, Footer, WhatsAppFloat, WhatsAppButton, LeadForm, FAQ, Breadcrumb, Tracking, CookieBanner, ServiceCard, RegionGrid, Steps, Testimonials, PriceTable)
    layouts/ (Base.astro)
    pages/ (index, [servico], montador-de-moveis/index, montador-de-moveis/[regiao], precos, sobre, contato, trabalhe-conosco, blog/index, blog/[slug], politica-de-privacidade, obrigado, 404)
    content/blog/*.md
    lib/ (whatsapp.ts, tracking.ts, seo.ts, utm.ts)
    styles/global.css
  public/ (robots.txt, og.png, img/, favicon)
  docs/ (FOTOS.md, GTM.md, LEADS_APPS_SCRIPT.md, PUBLICAR_REGIAO.md)
  scripts/ (check-seo.ts: valida limites de title e description e regiões sem texto)
```

## 10. Ordem de execução

1. Inicializar projeto, instalar dependências com versões verificadas, configurar Tailwind, fontes e `Base.astro`.
2. Criar `site.ts`, `servicos.ts` (com todo o conteúdo), `regioes.json`, `faq.ts`, `depoimentos.ts`.
3. Componentes de conversão (WhatsApp, LeadForm, Tracking, CookieBanner) e `lib/`.
4. Home, páginas de serviço, hub e páginas de região.
5. Preços, sobre, contato, trabalhe conosco, blog com 3 artigos, política, obrigado, 404.
6. SEO: componente, JSON-LD, sitemap, robots, redirects, `check-seo.ts` rodando no `npm run build`.
7. README e docs.
8. Rodar `npm run build`, corrigir tudo, rodar Lighthouse (via `npx unlighthouse` ou `lighthouse` CLI) em home, um serviço e uma região, e me mostrar as notas.
9. Ao final, listar em uma tabela: o que está pronto, o que depende de dados meus (WhatsApp, CNPJ, preços, fotos, parágrafos de região) e o caminho exato de cada arquivo que eu preciso editar.

Faça commits pequenos por etapa. Antes de começar, me mostre o plano em uma tabela de 10 linhas no máximo e siga sem esperar aprovação a cada passo. Pergunte só se algo bloquear o build.
