export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export interface Servico {
  slug: string;
  nome: string;
  nomeCurto: string;
  tituloSEO: string; // máx. 60 caracteres
  h1: string;
  metaDescription: string; // máx. 155 caracteres
  palavraChave: string;
  resumo: string; // 1 frase
  descricaoLonga: string[]; // 4 a 6 parágrafos curtos
  oQueIncluso: string[];
  naoIncluso: string[];
  tempoMedio: string;
  faq: FaqItem[]; // 5 perguntas
  moveisExemplo: string[];
  imagem?: string; // nome do arquivo em public/img/, sem extensão (ex.: "montador-2")
}

export type MacroRegiao = "Capital" | "ABC" | "Grande SP";

export interface Regiao {
  slug: string;
  nome: string;
  macroRegiao: MacroRegiao;
  prioridade: 1 | 2 | 3;
  bairrosVizinhos: string[];
  paragrafoUnico: string;
  publicada: boolean;
}

export interface Depoimento {
  nome: string;
  bairro: string;
  servico: string;
  texto: string;
  nota: 1 | 2 | 3 | 4 | 5;
  placeholder: boolean;
}
