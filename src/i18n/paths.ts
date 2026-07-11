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

// Resolve o parâmetro ?next= para um caminho final. Aceita tanto uma rota
// canônica ("/catalogo") quanto um caminho já localizado ("/pt/musica/x") —
// este último é usado pra devolver a pessoa exatamente pra onde ela estava.
export function resolveNext(next: string | undefined, locale: string): string {
  if (!next) return localizedPath("/conta", locale);
  if (/^\/(pt|en)(\/|$)/.test(next)) return next;
  return localizedPath(next, locale);
}
