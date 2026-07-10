import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { alternates } from "@/i18n/seo";
import SiteHeader from "@/components/SiteHeader";
import TrackPreviewPlayer from "@/components/TrackPreviewPlayer";
import TrackDownloadButton from "@/components/TrackDownloadButton";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import { createClient } from "@/lib/supabase/server";
import type { Track } from "@/lib/types";

const getTrack = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Track | null) ?? null;
});

function coverUrlDe(track: Track) {
  if (!track.cover_path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/tracks-covers/${track.cover_path}`;
}

function formatDuracao(segundos: number | null) {
  if (!segundos) return null;
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const track = await getTrack(id);
  if (!track) return {};

  const cover = coverUrlDe(track);
  const description =
    locale === "en"
      ? `${track.title} — ${track.brand}. Copyright-free track on Garagem Beats.`
      : `${track.title} — ${track.brand}. Trilha livre de copyright na Garagem Beats.`;

  return {
    title: track.title,
    description,
    alternates: alternates(`/musica/${id}`, locale),
    openGraph: {
      title: `${track.title} — ${track.brand}`,
      description,
      images: cover ? [{ url: cover }] : undefined,
    },
  };
}

export default async function MusicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("catalogo");
  const track = await getTrack(id);
  if (!track) notFound();

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const isLoggedIn = !!userData.user;

  let isFavorited = false;
  if (userData.user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("track_id")
      .eq("user_id", userData.user.id)
      .eq("track_id", id)
      .maybeSingle();
    isFavorited = !!fav;
  }

  const { count: downloadsTotal } = await supabase
    .from("downloads")
    .select("id", { count: "exact", head: true })
    .eq("track_id", id);

  const { data: relacionadasData } = await supabase
    .from("tracks")
    .select("*")
    .eq("brand", track.brand)
    .neq("id", id)
    .limit(6);
  const relacionadas = (relacionadasData ?? []) as Track[];

  const cover = coverUrlDe(track);
  const duracao = formatDuracao(track.duration_seconds);
  const total = downloadsTotal ?? 0;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-sm text-[#888] transition-colors hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {t("voltarCatalogo")}
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row">
            <div className="relative aspect-square w-full max-w-[260px] shrink-0 self-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0000] to-[#3a0a0a] sm:self-start">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={track.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                    <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="1.5" opacity="0.6" />
                    <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="1.5" opacity="0.6" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <TrackPreviewPlayer
                  track={{
                    id: track.id,
                    title: track.title,
                    brand: track.brand,
                    coverUrl: cover,
                    audioPath: track.audio_path,
                  }}
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {track.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-0.5 text-xs text-[#888]">
                  {track.brand}
                </span>
                {track.estilo && (
                  <EstiloTag value={track.estilo} />
                )}
                {duracao && (
                  <span className="text-xs text-[#555]">{duracao}</span>
                )}
                {total > 0 && (
                  <span className="text-xs text-[#555]">
                    · {total} {total === 1 ? t("download") : t("downloads")}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-[#888]">
                {t("inclusoNaAssinatura")}
              </p>

              <div className="mt-5 flex items-center gap-2">
                <TrackDownloadButton
                  trackId={track.id}
                  audioPath={track.audio_path}
                  title={track.title}
                  isLoggedIn={isLoggedIn}
                />
                <FavoriteButton
                  trackId={track.id}
                  initialFavorited={isFavorited}
                  isLoggedIn={isLoggedIn}
                />
                <ShareButton trackId={track.id} />
              </div>
            </div>
          </div>

          {relacionadas.length > 0 && (
            <div className="mt-14">
              <h2 className="text-lg font-semibold text-white">
                {t("maisDaMarca", { marca: track.brand })}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {relacionadas.map((rel) => {
                  const relCover = coverUrlDe(rel);
                  return (
                    <Link
                      key={rel.id}
                      href={{ pathname: "/musica/[id]", params: { id: rel.id } }}
                      className="group flex flex-col rounded-2xl border border-[#1a1a1a] bg-[#111] p-3 transition-colors hover:border-[#333]"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-[#1a0000] to-[#3a0a0a]">
                        {relCover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={relCover}
                            alt={rel.title}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <p className="mt-2 truncate text-sm font-medium text-white">
                        {rel.title}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

async function EstiloTag({ value }: { value: string }) {
  const t = await getTranslations("estilos");
  return (
    <span className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-0.5 text-xs text-[#888]">
      {t(value as never)}
    </span>
  );
}
