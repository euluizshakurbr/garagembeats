import { routing } from "./routing";

// Converte uma rota canônica (ex: "/planos") em um caminho completo já
// localizado, com prefixo de locale e slug traduzido (ex: "/en/plans").
// Usa cast interno pra evitar o atrito de tipos das rotas tipadas quando
// o valor vem de uma string dinâmica (ex: parâmetro ?next=).
export function localizedPath(canonical: string, locale: string): string {
  const entry = (routing.pathnames as Record<string, unknown>)[canonical];
  let slug = canonical;
  if (typeof entry === "string") {
    slug = entry;
  } else if (entry && typeof entry === "object") {
    slug = (entry as Record<string, string>)[locale] ?? canonical;
  }
  return `/${locale}${slug === "/" ? "" : slug}`;
}
