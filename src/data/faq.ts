import { site } from "./site";
import type { FaqItem } from "./types";

// FAQ geral usada na home e na página de contato.
// Não incluir pergunta sobre garantia nem sobre forma de pagamento: são tratadas na conversa do WhatsApp.
export const faqGeral: FaqItem[] = [
  {
    pergunta: "Quais regiões vocês atendem?",
    resposta: "Toda a capital, o ABC e a Grande São Paulo. Se o seu bairro não aparece na lista do site, mande a mensagem mesmo assim. Na maioria dos casos conseguimos atender.",
  },
  {
    pergunta: "Como funciona o orçamento?",
    resposta: "Você manda pelo WhatsApp a lista dos móveis ou uma foto das caixas, com o bairro e o andar. A gente confere o que o serviço exige e retorna com o valor. Você aprova antes de qualquer agendamento.",
  },
  {
    pergunta: "Vocês montam móveis planejados?",
    resposta: "Montamos. Planejado costuma chegar em módulos numerados, e a montagem exige conferir as peças contra o projeto antes de começar. Mande o projeto ou fotos dos módulos junto com o pedido de orçamento.",
  },
  {
    pergunta: "Que tipo de móvel vocês montam?",
    resposta: "Móvel de kit comprado em loja física ou online, planejado sob medida, móvel de escritório e peça usada que já foi desmontada. Montagem, desmontagem, ajuste e instalação na parede.",
  },
  {
    pergunta: "Em quanto tempo conseguem vir?",
    resposta: `Depende da agenda do montador que atende a sua região e do tamanho do serviço. Atendemos de ${site.horario.toLowerCase()}. Diga no WhatsApp a data que você prefere e a gente confirma o que dá para encaixar.`,
  },
  {
    pergunta: "Meu móvel veio sem manual. Vocês montam?",
    resposta: "Montamos. Móvel de linha o montador conhece de cor. Para peça fora do padrão, mande uma foto das partes que você recebeu e a gente confirma antes de agendar.",
  },
  {
    pergunta: "Vocês montam móvel usado ou que já foi desmontado?",
    resposta: "Sim. Avise que o móvel é usado, para o montador levar parafusos e cavilhas de reposição. Se alguma peça estiver quebrada ou faltando, você é avisado antes de começar.",
  },
  {
    pergunta: "Preciso ter ferramentas em casa?",
    resposta: "Não. O montador leva parafusadeira, furadeira, nível, jogo de chaves e brocas. Você só precisa deixar as caixas no cômodo onde o móvel vai ficar e um espaço livre no chão para abrir as peças.",
  },
  {
    pergunta: "O que eu preciso deixar pronto antes da montagem?",
    resposta: "Caixas no cômodo certo, chão livre, tomada por perto e o manual, se veio um. Em prédio, confirme se a portaria exige agendamento para serviço e se o elevador precisa ser reservado.",
  },
  {
    pergunta: "E se eu precisar cancelar ou remarcar?",
    resposta: "Avise pelo WhatsApp assim que souber e a gente remarca. Cancelamento em cima da hora, com o montador já a caminho, é combinado no momento.",
  },
  // NOTA FISCAL: liberar aqui quando temCnpj = true
  ...(site.temCnpj
    ? [
        {
          pergunta: "Vocês emitem nota fiscal?",
          resposta: "Sim. A nota fiscal de serviço sai no mesmo dia do pagamento, em nome de quem você indicar. Peça no WhatsApp ao fechar o orçamento.",
        },
      ]
    : []),
];
