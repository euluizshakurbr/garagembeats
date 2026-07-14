import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/i18n/seo";
import SiteHeader from "@/components/SiteHeader";
import CatalogoGrid from "@/components/CatalogoGrid";
import SupabaseSetupNotice from "@/components/SupabaseSetupNotice";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getEncomendaPreco } from "@/lib/plans";
import { assinarPreviews } from "@/lib/previewUrls";
import type { Track } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations();
  return {
    title: t("nav.catalogo"),
    description: t("catalogo.subtitulo"),
    alternates: alternates("/catalogo", locale),
  };
}

export default async function CatalogoPage() {
  const t = await getTranslations("catalogo");
  const locale = await getLocale();
  const encomendaPreco = getEncomendaPreco(locale).label;
  const configured = isSupabaseConfigured();
  let tracks: Array<
    Track & {
      coverUrl: string | null;
      downloadsTotal: number;
      downloads30d: number;
      previewUrl: string | null;
    }
  > = [];
  let isLoggedIn = false;
  let totalDownloads = 0;
  let favoritedIds: string[] = [];

  if (configured) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    isLoggedIn = !!userData.user;

    if (userData.user) {
      const { data: favoritesData } = await supabase
        .from("favorites")
        .select("track_id")
        .eq("user_id", userData.user.id);
      favoritedIds = (favoritesData ?? []).map((f) => f.track_id);
    }

    const { data: tracksData, error: tracksError } = await supabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false });

    if (tracksError) {
      console.error("Erro ao buscar tracks no /catalogo:", {
        message: tracksError.message,
        code: tracksError.code,
        details: tracksError.details,
        hint: tracksError.hint,
      });
    }

    // Contadores agregados direto no banco (função security definer) — a RLS
    // de `downloads` esconde as linhas dos outros usuários, então contar aqui
    // no servidor com o client do visitante devolveria sempre zero.
    const { data: statsData, error: statsError } = await supabase.rpc(
      "get_download_stats"
    );

    if (statsError) {
      console.error("Erro ao buscar stats de downloads no /catalogo:", {
        message: statsError.message,
        code: statsError.code,
        hint: statsError.hint,
      });
    }

    const totalPorTrack = new Map<string, number>();
    const recentesPorTrack = new Map<string, number>();

    for (const stat of statsData ?? []) {
      totalPorTrack.set(stat.track_id, Number(stat.total));
      recentesPorTrack.set(stat.track_id, Number(stat.last_30d));
      totalDownloads += Number(stat.total);
    }

    const previewMap = await assinarPreviews(
      (tracksData ?? []).map((t) => t.audio_path)
    );

    tracks = ((tracksData ?? []) as Track[]).map((track) => ({
      ...track,
      coverUrl: track.cover_path
        ? supabase.storage.from("tracks-covers").getPublicUrl(track.cover_path)
            .data.publicUrl
        : null,
      downloadsTotal: totalPorTrack.get(track.id) ?? 0,
      downloads30d: recentesPorTrack.get(track.id) ?? 0,
      previewUrl: previewMap[track.audio_path] ?? null,
    }));
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {t("titulo")}
              </h1>
              <p className="mt-2 text-[#888]">{t("subtitulo")}</p>
            </div>
            <Link
              href="/planos"
              className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs font-semibold text-[#888] transition-colors hover:border-[#555] hover:text-white"
            >
              {t("verPlanos")}
            </Link>
          </div>

          {!configured ? (
            <SupabaseSetupNotice />
          ) : (
            <>
              {tracks.length === 0 ? (
                <p className="mt-10 text-[#555]">{t("nenhumaMusica")}</p>
              ) : (
                <>
                  <p className="mt-3 text-xs text-[#555]">
                    {tracks.length} {t("statTrilhas")} · {totalDownloads}{" "}
                    {t("statDownloads")}
                  </p>
                  <CatalogoGrid
                    tracks={tracks}
                    isLoggedIn={isLoggedIn}
                    favoritedIds={favoritedIds}
                  />
                </>
              )}

              <div className="mt-10 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#CC1111]/30 bg-gradient-to-b from-[#1a0808] to-[#111] px-5 py-5 text-center sm:flex-row sm:text-left">
                <div>
                  <p className="font-semibold text-white">
                    {t("encomendaBannerTitulo")}
                  </p>
                  <p className="mt-1 text-sm text-[#888]">
                    {t("encomendaBannerDesc", { preco: encomendaPreco })}
                  </p>
                </div>
                <Link
                  href="/encomenda"
                  className="shrink-0 rounded-xl bg-[#CC1111] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
                >
                  {t("encomendaBannerCta")}
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
