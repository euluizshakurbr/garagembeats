import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { alternates } from "@/i18n/seo";
import SiteHeader from "@/components/SiteHeader";
import MetaEvent from "@/components/MetaEvent";
import TrackPreviewPlayer from "@/components/TrackPreviewPlayer";
import TrackDownloadButton from "@/components/TrackDownloadButton";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import { createClient } from "@/lib/supabase/server";
import { getEncomendaPreco } from "@/lib/plans";
import type { Track } from "@/lib/types";

const getTrack = cache(async (slugOrId: string) => {
  const supabase = await createClient();
  // Primeiro tenta por slug (URL amigável); se não achar e parecer um id
  // (uuid), tenta por id — assim links antigos continuam funcionando.
  let { data } = await supabase
    .from("tracks")
    .select("*")
    .eq("slug", slugOrId)
    .maybeSingle();

  if (!data && /^[0-9a-f-]{36}$/i.test(slugOrId)) {
    ({ data } = await supabase
      .from("tracks")
      .select("*")
      .eq("id", slugOrId)
      .maybeSingle());
  }
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
    alternates: alternates(`/musica/${track.slug ?? id}`, locale),
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
  const locale = await getLocale();
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

  // Recomendações: mesma marca primeiro, depois mesmo estilo, e completa com
  // recentes se faltar — pra seção nunca ficar vazia (upsell/descoberta).
  const vistos = new Set<string>([track.id]);
  const relacionadas: Track[] = [];
  function addRelacionadas(list: Track[] | null) {
    for (const tr of list ?? []) {
      if (relacionadas.length >= 6) break;
      if (!vistos.has(tr.id)) {
        vistos.add(tr.id);
        relacionadas.push(tr);
      }
    }
  }

  const { data: porMarca } = await supabase
    .from("tracks")
    .select("*")
    .eq("brand", track.brand)
    .neq("id", track.id)
    .limit(6);
  addRelacionadas(porMarca as Track[] | null);

  if (relacionadas.length < 6 && track.estilo) {
    const { data: porEstilo } = await supabase
      .from("tracks")
      .select("*")
      .eq("estilo", track.estilo)
      .neq("id", track.id)
      .limit(6);
    addRelacionadas(porEstilo as Track[] | null);
  }

  if (relacionadas.length < 6) {
    const { data: recentes } = await supabase
      .from("tracks")
      .select("*")
      .neq("id", track.id)
      .order("created_at", { ascending: false })
      .limit(12);
    addRelacionadas(recentes as Track[] | null);
  }

  const cover = coverUrlDe(track);
  const duracao = formatDuracao(track.duration_seconds);
  const total = downloadsTotal ?? 0;
  const encomendaPreco = getEncomendaPreco(locale).label;

  return (
    <div className="flex flex-1 flex-col">
      <MetaEvent
        event="ViewContent"
        params={{
          content_type: "product",
          content_ids: [track.slug ?? track.id],
          content_name: track.title,
          content_category: track.brand,
        }}
      />
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
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {track.title}
              </h1>

              <p className="mt-2 flex items-center gap-1.5 text-xs text-[#888]">
                <span className="text-[#CC1111]">●</span> {t("trilhaOriginal")}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-0.5 text-xs text-[#888]">
                  {track.brand}
                </span>
                {track.estilo && <EstiloTag value={track.estilo} />}
                {duracao && <span className="text-xs text-[#555]">{duracao}</span>}
                {total > 0 && (
                  <span className="text-xs text-[#555]">
                    · {total} {total === 1 ? t("download") : t("downloads")}
                  </span>
                )}
              </div>

              {/* CTA principal */}
              <div className="mt-6 flex flex-col gap-2">
                <TrackPreviewPlayer
                  track={{
                    id: track.id,
                    title: track.title,
                    brand: track.brand,
                    coverUrl: cover,
                    audioPath: track.audio_path,
                  }}
                  full
                />
                <TrackDownloadButton
                  trackId={track.id}
                  audioPath={track.audio_path}
                  title={track.title}
                  isLoggedIn={isLoggedIn}
                  full
                  label={t("baixarEssa")}
                />
                {!isLoggedIn && (
                  <p className="text-center text-xs text-[#888]">
                    {t("criarContaBaixar")}
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="mt-4 flex items-center justify-center gap-2 sm:justify-start">
                <FavoriteButton
                  trackId={track.id}
                  initialFavorited={isFavorited}
                  isLoggedIn={isLoggedIn}
                />
                <ShareButton trackId={track.slug ?? track.id} />
              </div>

              {/* Quer todas as trilhas? */}
              <Link
                href="/planos"
                className="mt-5 block text-center text-sm text-[#888] transition-colors hover:text-white sm:text-left"
              >
                {t("quererTodasTrilhas")}{" "}
                <span className="font-semibold text-white underline underline-offset-2">
                  {t("verPlanos")}
                </span>
              </Link>

              {/* Upsell: música personalizada */}
              <div className="mt-6 rounded-2xl border border-[#CC1111]/30 bg-gradient-to-b from-[#1a0808] to-[#111] p-4">
                <p className="font-semibold text-white">
                  {t("upsellEncomendaTitulo")}
                </p>
                <p className="mt-1 text-sm text-[#888]">
                  {t("upsellEncomendaDesc", { preco: encomendaPreco })}
                </p>
                <Link
                  href="/encomenda"
                  className="mt-3 inline-flex rounded-xl border border-[#333] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#555]"
                >
                  {t("encomendarAgora")}
                </Link>
              </div>
            </div>
          </div>

          {relacionadas.length > 0 && (
            <div className="mt-14">
              <h2 className="text-lg font-semibold text-white">
                {t("recomendadas")}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {relacionadas.map((rel) => {
                  const relCover = coverUrlDe(rel);
                  return (
                    <Link
                      key={rel.id}
                      href={{
                        pathname: "/musica/[id]",
                        params: { id: rel.slug ?? rel.id },
                      }}
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
