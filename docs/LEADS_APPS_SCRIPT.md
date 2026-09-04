# Receber leads numa planilha Google

O formulário abre o WhatsApp sempre. Se `PUBLIC_LEAD_WEBHOOK_URL` estiver preenchida, ele também manda um POST JSON para essa URL, com os campos do formulário, a página e os `utm_*` da primeira visita. Um Google Apps Script grava isso numa planilha.

## Passo a passo

1. Crie uma planilha Google. Na primeira aba, coloque na linha 1 os cabeçalhos:
   `data_hora | nome | whatsapp | regiao | servico | moveis | data_desejada | pagina | utm_source | utm_medium | utm_campaign | utm_term | utm_content | gclid | fbclid`
2. Extensões > Apps Script. Apague o conteúdo e cole o código abaixo.
3. Implantar > Nova implantação > Tipo: App da Web. Executar como: você. Quem tem acesso: Qualquer pessoa. Implantar e autorizar.
4. Copie a URL que termina em `/exec`.
5. No GitHub: Settings > Secrets and variables > Actions > Variables: `PUBLIC_LEAD_WEBHOOK_URL` = essa URL. Local: `.env`.
6. Push. Teste enviando o formulário do site e veja a linha aparecer.

## Código

```js
const ABA = "Página1"; // nome da aba

function doPost(e) {
  try {
    const dados = JSON.parse(e.postData.contents || "{}");
    const planilha = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA);
    planilha.appendRow([
      new Date(),
      dados.nome || "",
      dados.whatsapp || "",
      dados.regiao || "",
      dados.servico || "",
      dados.moveis || "",
      dados.data || "",
      dados.pagina || "",
      dados.utm_source || "",
      dados.utm_medium || "",
      dados.utm_campaign || "",
      dados.utm_term || "",
      dados.utm_content || "",
      dados.gclid || "",
      dados.fbclid || "",
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (erro) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: String(erro) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("ok");
}
```

## Observações

- O site envia com `mode: "no-cors"` e `Content-Type: text/plain`, o que evita preflight CORS. O Apps Script recebe o JSON no corpo e faz o parse.
- O navegador não lê a resposta (no-cors). Se o script falhar, o lead ainda chega pelo WhatsApp.
- Cada nova versão do código exige "Nova implantação" (ou "Gerenciar implantações > editar > nova versão") para atualizar a URL.
- Opcional: no `doPost`, chame `MailApp.sendEmail(...)` para receber aviso por e-mail a cada lead.
