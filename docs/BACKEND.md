# Backend dos leads (Cloudflare Worker + D1 + R2)

O site é estático no Cloudflare Pages e não guarda nada. Quem recebe o formulário, grava no banco e armazena as fotos é um Worker na Cloudflare, na pasta `worker/` deste repositório.

> Este backend é opcional e está **desligado** (`site.formularioAtivo` é `false`). A pasta `worker/` não entra no build do site: o Cloudflare Pages roda apenas `npm run build` na raiz. Só siga este documento quando decidir religar o formulário.

## Por que assim

Site estático não tem onde esconder senha: tudo que vai no HTML ou no JavaScript é público. Por isso a divisão é esta:

- `POST /lead` é **só escrita**. Não devolve nenhum dado do banco. É o único endereço que o site chama.
- Ler os leads exige senha, e a senha vive só dentro do Worker, nunca no repositório e nunca no navegador.
- As fotos ficam num bucket R2 privado, sem URL pública. Só saem pelo painel autenticado.

## O que o Worker faz

| Rota | Método | Acesso | O que faz |
|---|---|---|---|
| `/lead` | POST | público (só as origens do site) | Valida os campos, grava até 5 fotos no R2 e insere a linha no D1 |
| `/admin` | GET | senha | Painel HTML com os 200 leads mais recentes |
| `/admin/export.csv` | GET | senha | Baixa tudo em CSV |
| `/admin/foto/<chave>` | GET | senha | Serve uma foto do R2 |

Proteções já embutidas: honeypot, limite de 5 envios por IP por hora, limite de tamanho em todos os campos, tipos de imagem restritos a JPEG, PNG, WebP e HEIC, teto de 5 MB por foto, CORS restrito às origens do site, comparação de senha em tempo constante, e erro interno que nunca vaza detalhe do banco.

O IP nunca é gravado puro. Guardamos o SHA-256 do IP somado a um salt secreto, só para contar envios repetidos. Sem o salt não dá para voltar ao IP.

## Instalação

Tudo abaixo roda dentro da pasta `worker/`. Você precisa estar logado na conta Cloudflare que hospeda o domínio.

```bash
cd worker
npm install
npx wrangler login
```

### 1. Criar o banco

```bash
npx wrangler d1 create montamoveissp-leads
```

O comando imprime um `database_id`. Copie e cole em `worker/wrangler.toml`, no lugar de `PREENCHER_APOS_CRIAR_O_BANCO`.

### 2. Criar as tabelas

```bash
npx wrangler d1 execute montamoveissp-leads --remote --file=./schema.sql
```

### 3. Criar o bucket das fotos

```bash
npx wrangler r2 bucket create montamoveissp-fotos
```

Não marque o bucket como público. As fotos são servidas pelo Worker, com senha.

### 4. Definir os segredos

Três segredos. Eles são pedidos no terminal e não ficam gravados em arquivo nenhum.

```bash
npx wrangler secret put ADMIN_USUARIO   # o usuário do painel, ex.: murilo
npx wrangler secret put ADMIN_SENHA     # senha longa e aleatória, ver abaixo
npx wrangler secret put IP_SALT         # string aleatória, nunca precisa ser lembrada
```

Gere os valores aleatórios assim, e cole quando o terminal pedir:

```bash
openssl rand -base64 32
```

Guarde a senha do painel no seu gerenciador de senhas. Ela não é recuperável: se perder, rode `wrangler secret put ADMIN_SENHA` de novo e defina outra.

**Nunca** coloque esses valores em `wrangler.toml`, em `.env`, num commit ou numa mensagem. O `.gitignore` já bloqueia `.dev.vars` e `.env`, que são os arquivos onde eles poderiam vazar sem querer.

### 5. Publicar

```bash
npx wrangler deploy
```

A saída mostra a URL, algo como `https://montamoveissp-leads.SEU-SUBDOMINIO.workers.dev`.

### 6. Ligar no site

No GitHub, Settings > Secrets and variables > Actions > Variables, crie:

```
PUBLIC_LEAD_ENDPOINT = https://montamoveissp-leads.SEU-SUBDOMINIO.workers.dev/lead
```

Para testar local, coloque a mesma linha no seu `.env`.

### 7. Abrir o formulário

O formulário está desligado. Em `src/data/site.ts`, mude `formularioAtivo` para `true` e faça o deploy. Enquanto for `false`, o site mostra um bloco de WhatsApp no lugar do formulário e nada é gravado.

## Usar o painel

Abra `https://SEU-WORKER.workers.dev/admin`. O navegador pede usuário e senha. De lá dá para ver os leads, abrir as fotos e baixar o CSV.

O painel tem `noindex` e `Cache-Control: no-store`. Ainda assim, não compartilhe a URL: quem tem a senha vê todos os dados dos clientes.

## Ajustes comuns

- **Mudar as origens autorizadas:** edite `ORIGENS_PERMITIDAS` em `worker/wrangler.toml` e publique de novo. Ao ligar o domínio próprio, deixe só ele e remova `murilomrm.github.io`.
- **Mudar o limite de envios por IP:** constante `LIMITE_POR_HORA` em `worker/src/index.ts`.
- **Mudar o limite de fotos ou de tamanho:** constantes `MAX_FOTOS` e `MAX_BYTES` no mesmo arquivo. Mude também os valores no `LeadForm.astro`, senão o navegador aceita e o Worker descarta.
- **Ver erros em tempo real:** `npx wrangler tail` dentro de `worker/`.

## Apagar dados de um cliente (LGPD)

Se alguém pedir exclusão, pegue o id no painel e rode:

```bash
npx wrangler d1 execute montamoveissp-leads --remote --command="DELETE FROM leads WHERE id = 'ID-DO-LEAD'"
```

As fotos daquele lead ficam no R2 sob o prefixo `AAAA-MM-DD/ID-DO-LEAD/`. Apague com:

```bash
npx wrangler r2 object delete montamoveissp-fotos/AAAA-MM-DD/ID-DO-LEAD/1.jpg
```

## Custo

O plano gratuito da Cloudflare cobre com folga o volume desta fase: 100 mil requisições por dia no Worker, 5 GB no D1 e 10 GB no R2.
