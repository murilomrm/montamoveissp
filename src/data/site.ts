export const site = {
  nome: "MontaMóveis SP",
  dominio: import.meta.env?.PUBLIC_SITE_URL || "https://www.montamoveissp.com.br",
  whatsapp: "5511982043902", // chip dedicado (trocado do número pessoal em 2026-09-05)
  telefoneExibicao: "(11) 98204-3902",
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
  instagram: "https://www.instagram.com/montamoveis.sp/",
  instagramUsuario: "@montamoveis.sp",
  mensagemWhatsappPadrao: "Olá! Quero um orçamento de montagem de móveis.",

  // REGRA FIXA: nunca true. Nenhuma página exibe tabela de preço. Todo CTA de preço leva ao WhatsApp.
  exibirPrecoNoSite: false,

  // Única exceção ao preço: o piso do serviço, sempre como "a partir de". Filtra quem procura serviço pequeno
  // e precisa bater com o recurso de preço do Google Ads. O validador só aceita "R$ 400" enquanto isto for true.
  exibirValorMinimo: true,
  valorMinimo: 400,

  // REGRA FIXA: a MontaMóveis SP é um marketplace que conecta cliente e montador.
  // Nenhum texto do site pode prometer garantia, prazo de resposta ou forma de pagamento.
  // Garantia e pagamento são tratados caso a caso na conversa do WhatsApp.
  prometerGarantia: false,
  prometerPrazoResposta: false,
  exibirFormaDePagamento: false,

  // Formulário de lead desligado na fase de teste: a captação é só pelo WhatsApp.
  // Vire true para voltar a exibir o LeadForm em todas as páginas (o backend já aceita os envios).
  formularioAtivo: false,

  areaAtendida: ["São Paulo", "Santo André", "São Bernardo do Campo", "São Caetano do Sul", "Diadema", "Mauá", "Guarulhos", "Osasco", "Barueri", "Taboão da Serra", "Carapicuíba", "Cotia", "Santana de Parnaíba", "Mogi das Cruzes", "Suzano", "Itaquaquecetuba", "Embu das Artes", "Ferraz de Vasconcelos", "Poá", "Campinas", "Valinhos", "Vinhedo", "Louveira", "Itatiba", "Itupeva", "Jundiaí", "Várzea Paulista", "Campo Limpo Paulista", "Francisco Morato", "Franco da Rocha", "Caieiras", "Cajamar", "Pirapora do Bom Jesus", "Cabreúva", "Jarinu", "Atibaia", "Bom Jesus dos Perdões", "Bragança Paulista", "Nazaré Paulista", "Mairiporã", "Arujá", "Ribeirão Pires", "Itapecerica da Serra", "Itapevi", "Jandira"],
} as const;

export type Site = typeof site;
