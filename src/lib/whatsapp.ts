import { site } from "@/data/site";

export interface ContextoWhatsapp {
  servico?: string; // nome do serviço em minúsculas, ex.: "montagem de guarda-roupa"
  regiao?: string; // nome da região, ex.: "Moema"
  mensagem?: string; // sobrescreve a mensagem inteira
}

// Frase fixa no fim de toda mensagem: já orienta o cliente a mandar o que a gente precisa para orçar.
const COMPLEMENTO = "Vou te enviar fotos do que é necessário montar e localização com data aproximada.";

export function mensagemWhatsapp(ctx: ContextoWhatsapp = {}): string {
  if (ctx.mensagem) return ctx.mensagem;
  let abertura: string;
  if (ctx.servico && ctx.regiao) abertura = `Olá! Quero orçamento de ${ctx.servico} em ${ctx.regiao}.`;
  else if (ctx.servico) abertura = `Olá! Quero orçamento de ${ctx.servico}.`;
  else if (ctx.regiao) abertura = `Olá! Quero orçamento de montagem de móveis em ${ctx.regiao}.`;
  else abertura = site.mensagemWhatsappPadrao;
  return `${abertura} ${COMPLEMENTO}`;
}

// Único ponto do site que monta URL de WhatsApp.
// Formato api.whatsapp.com/send: abre o app no celular e o WhatsApp Web no desktop sem tela intermediária.
export function linkWhatsapp(ctx: ContextoWhatsapp = {}): string {
  const params = new URLSearchParams({
    phone: site.whatsapp,
    text: mensagemWhatsapp(ctx),
    type: "phone_number",
    app_absent: "0",
  });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}
