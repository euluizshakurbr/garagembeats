import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localizedPath } from "@/i18n/paths";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Páginas públicas (marketing) que queremos no Google — sem áreas logadas.
const ROUTES = [
  "/",
  "/catalogo",
  "/planos",
  "/encomenda",
  "/termos",
  "/privacidade",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((canonical) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = BASE + localizedPath(canonical, locale);
    }
    return {
      url: BASE + localizedPath(canonical, routing.defaultLocale),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: canonical === "/" ? 1 : 0.7,
      alternates: { languages },
    };
  });
}
