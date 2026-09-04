export const site = {
  nome: "MontaMóveis SP",
  dominio: import.meta.env?.PUBLIC_SITE_URL || "https://www.montamoveissp.com.br",
  whatsapp: "5511940803902", // número pessoal por enquanto. Trocar por chip dedicado ao completar 10 clientes
  telefoneExibicao: "(11) 94080-3902",
  temEmail: false, // sem e-mail nesta fase. Nenhum componente deve exibir e-mail enquanto for false
  email: "",
  temCnpj: false, // vira true quando o MEI for aberto. Enquanto false, nenhum texto pode mencionar nota fiscal
  cnpj: "",
  razaoSocial: "",
  enderecoBase: { cidade: "São Paulo", uf: "SP" },
  horario: "Seg a Sex 7h às 20h, Sáb 8h às 18h",
  horarioSchema: [
    { dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], abre: "07:00", fecha: "20:00" },
    { dias: ["Saturday"], abre: "08:00", fecha: "18:00" },
  ],
  garantiaDias: 90,
  tempoOrcamento: "5 minutos",
  instagram: "", // preencher com a URL do perfil quando existir
  mensagemWhatsappPadrao: "Olá! Quero um orçamento de montagem de móveis.",
  exibirPrecoNoSite: false, // regra fixa do projeto: nunca true. Todo CTA de preço leva ao WhatsApp
  areaAtendida: ["São Paulo", "Santo André", "São Bernardo do Campo", "São Caetano do Sul", "Diadema", "Mauá", "Guarulhos", "Osasco", "Barueri", "Taboão da Serra", "Carapicuíba", "Cotia", "Santana de Parnaíba", "Mogi das Cruzes", "Suzano", "Itaquaquecetuba", "Embu das Artes", "Ferraz de Vasconcelos", "Poá"],
} as const;

export type Site = typeof site;
