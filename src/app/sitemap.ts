import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localizedPath } from "@/i18n/paths";
import { createAdminClient } from "@/lib/supabase/admin";

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

function musicaPath(id: string, locale: string) {
  return locale === "en" ? `/en/song/${id}` : `/pt/musica/${id}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginas: MetadataRoute.Sitemap = ROUTES.map((canonical) => {
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

  // Uma URL por música (com hreflang PT/EN).
  let musicas: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("tracks")
      .select("id, slug, created_at")
      .order("created_at", { ascending: false });

    musicas = (data ?? []).map((track) => {
      const seg = track.slug ?? track.id;
      return {
        url: `${BASE}${musicaPath(seg, routing.defaultLocale)}`,
        lastModified: new Date(track.created_at),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: {
            pt: `${BASE}${musicaPath(seg, "pt")}`,
            en: `${BASE}${musicaPath(seg, "en")}`,
          },
        },
      };
    });
  } catch {
    // Se o Supabase falhar, o sitemap ainda sai com as páginas fixas.
  }

  return [...paginas, ...musicas];
}
