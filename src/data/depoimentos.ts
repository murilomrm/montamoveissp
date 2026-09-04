import type { Depoimento } from "./types";

// Depoimentos placeholder. NUNCA são renderizados sem ALLOW_PLACEHOLDERS=1 (só em dev local).
// Ao receber avaliações reais, substitua o texto e marque placeholder: false.
export const depoimentos: Depoimento[] = [
  { nome: "Cliente exemplo 1", bairro: "Moema", servico: "Montagem de guarda-roupa", texto: "[Depoimento de exemplo. Substituir por avaliação real de cliente.]", nota: 5, placeholder: true },
  { nome: "Cliente exemplo 2", bairro: "Pinheiros", servico: "Montagem de cozinha", texto: "[Depoimento de exemplo. Substituir por avaliação real de cliente.]", nota: 5, placeholder: true },
  { nome: "Cliente exemplo 3", bairro: "Santo André", servico: "Montagem e desmontagem para mudança", texto: "[Depoimento de exemplo. Substituir por avaliação real de cliente.]", nota: 5, placeholder: true },
  { nome: "Cliente exemplo 4", bairro: "Tatuapé", servico: "Montagem de cama box", texto: "[Depoimento de exemplo. Substituir por avaliação real de cliente.]", nota: 5, placeholder: true },
  { nome: "Cliente exemplo 5", bairro: "Guarulhos", servico: "Montagem de móveis comprados online", texto: "[Depoimento de exemplo. Substituir por avaliação real de cliente.]", nota: 5, placeholder: true },
  { nome: "Cliente exemplo 6", bairro: "Alphaville", servico: "Montagem de móveis planejados", texto: "[Depoimento de exemplo. Substituir por avaliação real de cliente.]", nota: 5, placeholder: true },
];
