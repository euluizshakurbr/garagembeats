import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/i18n/seo";
import SiteHeader from "@/components/SiteHeader";
import CatalogoGrid from "@/components/CatalogoGrid";
import SupabaseSetupNotice from "@/components/SupabaseSetupNotice";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Track } from "@/lib/types";

const TRINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;

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
  const configured = isSupabaseConfigured();
  let tracks: Array<
    Track & { coverUrl: string | null; downloadsTotal: number; downloads30d: number }
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

    const { data: downloadsData } = await supabase
      .from("downloads")
      .select("track_id, created_at");

    const agora = Date.now();
    const totalPorTrack = new Map<string, number>();
    const recentesPorTrack = new Map<string, number>();

    for (const download of downloadsData ?? []) {
      totalPorTrack.set(
        download.track_id,
        (totalPorTrack.get(download.track_id) ?? 0) + 1
      );
      if (agora - new Date(download.created_at).getTime() <= TRINTA_DIAS_MS) {
        recentesPorTrack.set(
          download.track_id,
          (recentesPorTrack.get(download.track_id) ?? 0) + 1
        );
      }
    }
    totalDownloads = downloadsData?.length ?? 0;

    tracks = ((tracksData ?? []) as Track[]).map((track) => ({
      ...track,
      coverUrl: track.cover_path
        ? supabase.storage.from("tracks-covers").getPublicUrl(track.cover_path)
            .data.publicUrl
        : null,
      downloadsTotal: totalPorTrack.get(track.id) ?? 0,
      downloads30d: recentesPorTrack.get(track.id) ?? 0,
    }));
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {t("titulo")}
              </h1>
              <p className="mt-2 text-[#888]">{t("subtitulo")}</p>
            </div>
            <Link
              href="/planos"
              className="rounded-xl border border-[#333] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#555]"
            >
              {t("verPlanos")}
            </Link>
          </div>

          {!configured ? (
            <SupabaseSetupNotice />
          ) : tracks.length === 0 ? (
            <p className="mt-10 text-[#555]">{t("nenhumaMusica")}</p>
          ) : (
            <>
              <div className="mt-8 flex flex-wrap gap-8 border-b border-[#1a1a1a] pb-8">
                <Stat value={String(tracks.length)} label={t("statTrilhas")} />
                <Stat value={String(totalDownloads)} label={t("statDownloads")} />
              </div>
              <CatalogoGrid
                tracks={tracks}
                isLoggedIn={isLoggedIn}
                favoritedIds={favoritedIds}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-[#555]">{label}</p>
    </div>
  );
}
