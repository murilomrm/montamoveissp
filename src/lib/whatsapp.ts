import { site } from "@/data/site";

export interface ContextoWhatsapp {
  servico?: string; // nome do serviço em minúsculas, ex.: "montagem de guarda-roupa"
  regiao?: string; // nome da região, ex.: "Moema"
  mensagem?: string; // sobrescreve a mensagem inteira
}

export function mensagemWhatsapp(ctx: ContextoWhatsapp = {}): string {
  if (ctx.mensagem) return ctx.mensagem;
  if (ctx.servico && ctx.regiao) return `Olá! Quero orçamento de ${ctx.servico} em ${ctx.regiao}.`;
  if (ctx.servico) return `Olá! Quero orçamento de ${ctx.servico}.`;
  if (ctx.regiao) return `Olá! Quero orçamento de montagem de móveis em ${ctx.regiao}.`;
  return site.mensagemWhatsappPadrao;
}

// Único ponto do site que monta URL de WhatsApp.
export function linkWhatsapp(ctx: ContextoWhatsapp = {}): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagemWhatsapp(ctx))}`;
}
