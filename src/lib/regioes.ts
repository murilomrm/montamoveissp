import regioesJson from "@/data/regioes.json";
import type { Regiao } from "@/data/types";

export const regioes = regioesJson as Regiao[];

export const regioesPublicadas = regioes.filter((r) => r.publicada);

export const regioesPrioridade1 = regioesPublicadas.filter((r) => r.prioridade === 1);

// 8 regiões principais do rodapé: prioridade 1, mistura de capital, ABC e Grande SP.
export const regioesRodape = regioesPrioridade1.slice(0, 8);

// 6 regiões que toda página de serviço linka.
export const regioesParaServico = regioesPrioridade1.slice(0, 6);

export function getRegiao(slug: string): Regiao | undefined {
  return regioes.find((r) => r.slug === slug);
}

// 4 regiões próximas: primeiro as que aparecem em bairrosVizinhos e estão publicadas, depois completa com a mesma macrorregião.
export function regioesProximas(regiao: Regiao, qtd = 4): Regiao[] {
  const vizinhasPorNome = regiao.bairrosVizinhos
    .map((nome) => regioesPublicadas.find((r) => r.nome === nome))
    .filter((r): r is Regiao => Boolean(r) && r!.slug !== regiao.slug);
  const resultado: Regiao[] = [];
  for (const r of vizinhasPorNome) if (!resultado.includes(r)) resultado.push(r);
  if (resultado.length < qtd) {
    const mesmaMacro = regioesPublicadas
      .filter((r) => r.macroRegiao === regiao.macroRegiao && r.slug !== regiao.slug && !resultado.includes(r))
      .sort((a, b) => a.prioridade - b.prioridade);
    for (const r of mesmaMacro) {
      if (resultado.length >= qtd) break;
      resultado.push(r);
    }
  }
  return resultado.slice(0, qtd);
}

export function agruparPorMacro(lista: Regiao[]): Record<string, Regiao[]> {
  const grupos: Record<string, Regiao[]> = { Capital: [], ABC: [], "Grande SP": [] };
  for (const r of lista) grupos[r.macroRegiao]?.push(r);
  return grupos;
}
