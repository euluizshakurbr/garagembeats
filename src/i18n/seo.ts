import type { Metadata } from "next";
import { routing } from "./routing";
import { localizedPath } from "./paths";

// Monta canonical + hreflang (alternates) para uma rota canônica.
// Ex: alternates("/planos", "en") -> canonical /en/plans e languages
// { pt: /pt/planos, en: /en/plans, x-default: /pt/planos }.
export function alternates(
  canonical: string,
  locale: string
): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = localizedPath(canonical, l);
  }
  languages["x-default"] = localizedPath(canonical, routing.defaultLocale);

  return {
    canonical: localizedPath(canonical, locale),
    languages,
  };
}
