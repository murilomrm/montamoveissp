import { site } from "./site";
import type { FaqItem } from "./types";

// FAQ geral usada na home e na página de contato.
export const faqGeral: FaqItem[] = [
  {
    pergunta: "Quais regiões vocês atendem?",
    resposta: "Toda a capital, o ABC e a Grande São Paulo. Se o seu bairro não aparece na lista do site, mande a mensagem mesmo assim. Na maioria dos casos conseguimos atender ou indicar quem atende.",
  },
  {
    pergunta: "Como funciona o orçamento?",
    resposta: `Você manda pelo WhatsApp a lista dos móveis ou uma foto das caixas, com o bairro e o andar. Em até ${site.tempoOrcamento} você recebe o valor fechado. Nada muda na hora, a não ser que apareça um móvel que não estava na lista.`,
  },
  {
    pergunta: "Tem garantia?",
    resposta: `Sim, ${site.garantiaDias} dias sobre a montagem. Se uma porta desalinhar, uma gaveta travar ou uma fixação afrouxar nesse prazo, voltamos sem custo. A garantia cobre o serviço, não defeito de fábrica da peça.`,
  },
  {
    pergunta: "Como pago?",
    resposta: "Pix, dinheiro ou cartão na maquininha, no fim do serviço, depois de você conferir tudo. Não pedimos adiantamento para agendar.",
  },
  {
    pergunta: "Em quanto tempo conseguem vir?",
    resposta: `Normalmente em 24 a 48 horas. Atendemos de ${site.horario.toLowerCase()}. Se você precisa para o mesmo dia, pergunte no WhatsApp: às vezes sobra horário na agenda.`,
  },
  {
    pergunta: "Meu móvel veio sem manual. Vocês montam?",
    resposta: "Montamos. Móvel de linha (guarda-roupa, cômoda, rack, cozinha modulada) o montador conhece de cor. Para peça fora do padrão, mande uma foto das partes que você recebeu e a gente confirma antes de agendar.",
  },
  {
    pergunta: "Vocês montam móvel usado ou que já foi desmontado?",
    resposta: "Sim. Só avise que o móvel é usado, para levarmos parafusos e cavilhas de reposição. Se alguma peça estiver quebrada ou faltando, avisamos antes de começar e combinamos como resolver.",
  },
  {
    pergunta: "Preciso ter ferramentas em casa?",
    resposta: "Não. O montador leva parafusadeira, furadeira, nível, jogo de chaves e brocas. Você só precisa deixar as caixas no cômodo onde o móvel vai ficar e um espaço livre no chão para abrir as peças.",
  },
  {
    pergunta: "E se eu precisar cancelar ou remarcar?",
    resposta: "Avise pelo WhatsApp até a véspera e remarcamos sem custo. Cancelamento no mesmo dia, com o montador já a caminho, pode ter custo de deslocamento, combinado no momento.",
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
