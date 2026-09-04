// Prefixa caminhos internos com o BASE_URL do Astro.
// Necessário enquanto o site estiver em murilomrm.github.io/montamoveissp. Com domínio próprio, BASE_PATH="/" e a função vira identidade.
const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

export function href(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${base}${path}` || "/";
}
