export interface PaginaSEO {
  title: string; // máx. 60
  description: string; // máx. 155
}

// Nenhuma description promete garantia, prazo de resposta ou forma de pagamento (ver site.ts).
export const paginas = {
  home: {
    title: "Montador de Móveis em São Paulo | MontaMóveis SP",
    description: "Montagem e desmontagem de móveis e planejados em São Paulo, ABC e Grande SP. Mande a lista pelo WhatsApp e receba o orçamento.",
  },
  hubRegioes: {
    title: "Montador de Móveis por Região em SP | MontaMóveis SP",
    description: "Encontre montador de móveis no seu bairro ou cidade: capital, ABC e Grande São Paulo. Peça o orçamento pelo WhatsApp.",
  },
  orcamento: {
    title: "Orçamento de Montagem de Móveis | MontaMóveis SP",
    description: "Veja como pedir orçamento de montagem de móveis pelo WhatsApp: mande a lista ou as fotos e receba o valor antes de agendar.",
  },
  sobre: {
    title: "Sobre a MontaMóveis SP | Montadores em São Paulo",
    description: "Quem somos e como selecionamos os montadores que atendem montagem, desmontagem e móveis planejados em São Paulo e região.",
  },
  contato: {
    title: "Contato | MontaMóveis SP",
    description: "Fale com a MontaMóveis SP pelo WhatsApp. Atendimento de segunda a sábado em São Paulo, ABC e Grande São Paulo.",
  },
  trabalheConosco: {
    title: "Trabalhe Conosco: Montador de Móveis | MontaMóveis SP",
    description: "Vaga para montador de móveis em São Paulo e região. Tenha ferramenta própria e experiência com kit de loja e planejado."
  },
  blog: {
    title: "Blog: Dicas de Montagem de Móveis | MontaMóveis SP",
    description: "Guias práticos sobre montagem, desmontagem, móveis planejados e mudança em São Paulo, escritos por quem monta todo dia.",
  },
  politica: {
    title: "Política de Privacidade | MontaMóveis SP",
    description: "Como a MontaMóveis SP coleta, usa e protege os dados enviados pelo site e pelo WhatsApp, conforme a LGPD.",
  },
  obrigado: {
    title: "Recebemos seu pedido | MontaMóveis SP",
    description: "Seu pedido de orçamento foi enviado. Continue a conversa no WhatsApp para receber o valor.",
  },
  erro404: {
    title: "Página não encontrada | MontaMóveis SP",
    description: "A página que você procurou não existe. Encontre sua região ou fale com a gente no WhatsApp.",
  },
} satisfies Record<string, PaginaSEO>;

// Padrões das páginas de região (o nome entra no lugar de {nome}).
export const regiaoSEO = {
  title: "Montador de Móveis em {nome} | MontaMóveis SP",
  description: "Montador de móveis em {nome}: montagem, desmontagem e planejados. Mande a lista pelo WhatsApp e receba o orçamento.",
};
