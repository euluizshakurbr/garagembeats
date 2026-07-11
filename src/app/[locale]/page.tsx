import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/i18n/seo";
import SiteHeader from "@/components/SiteHeader";
import HomeSearch from "@/components/HomeSearch";
import TrackPreviewPlayer from "@/components/TrackPreviewPlayer";
import Depoimentos from "@/components/Depoimentos";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { assinarPreviews } from "@/lib/previewUrls";
import type { Track } from "@/lib/types";
import { PLANS, getPlanPreco } from "@/lib/plans";
import {
  YouTubeIcon,
  TikTokIcon,
  SpotifyIcon,
  InstagramIcon,
  FacebookIcon,
} from "@/components/icons";

const PLATFORMS = [
  { name: "YouTube", Icon: YouTubeIcon },
  { name: "TikTok", Icon: TikTokIcon },
  { name: "Spotify", Icon: SpotifyIcon },
  { name: "Instagram", Icon: InstagramIcon },
  { name: "Facebook", Icon: FacebookIcon },
];

const GRADIENTS = [
  "from-[#1a0000] to-[#CC1111]",
  "from-[#0a0a1a] to-[#4040aa]",
  "from-[#1a1200] to-[#aa7700]",
  "from-[#1a0a00] to-[#aa4400]",
  "from-[#0a0a0a] to-[#555555]",
  "from-[#001a05] to-[#0a8a3a]",
];

const DEMO_TRACKS = [
  { title: "Turbo Rush", brand: "Volkswagen", gradient: GRADIENTS[0] },
  { title: "Luxury Drive", brand: "BMW", gradient: GRADIENTS[1] },
  { title: "Stance Mode", brand: "Fiat", gradient: GRADIENTS[2] },
  { title: "Muscle Up", brand: "Chevrolet", gradient: GRADIENTS[3] },
  { title: "Autobahn", brand: "Mercedes", gradient: GRADIENTS[4] },
  { title: "Off-Road Beat", brand: "Agrale", gradient: GRADIENTS[5] },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations();
  return {
    description: t("home.heroSubtitulo"),
    alternates: alternates("/", locale),
  };
}

export default async function Home() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  let isLoggedIn = false;
  const tracks: Track[] = [];
  let getCoverUrl = (_path: string) => "";
  let previewMap: Record<string, string> = {};

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    isLoggedIn = !!userData.user;

    const { data } = await supabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);
    if (data) tracks.push(...(data as Track[]));

    getCoverUrl = (path: string) =>
      supabase.storage.from("tracks-covers").getPublicUrl(path).data
        .publicUrl;

    previewMap = await assinarPreviews(tracks.map((track) => track.audio_path));
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1a1a1a] bg-[#111] px-4 py-1.5 text-xs font-medium text-[#888]">
              <span className="text-[#CC1111]">●</span> {t("badge")}
            </span>

            <h1 className="mt-6 text-5xl font-black leading-none tracking-tight text-white md:text-7xl">
              {t("heroTitulo1")}
              <br />
              <span className="text-[#CC1111]">{t("heroTitulo2")}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-[#888] md:text-xl">
              {t("heroSubtitulo")}
            </p>

            {/* Plataformas */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {PLATFORMS.map(({ name, Icon }) => (
                <span
                  key={name}
                  className="flex items-center gap-1.5 rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1 text-xs text-[#888]"
                >
                  <Icon />
                  {name}
                </span>
              ))}
            </div>

            <HomeSearch />

            {isLoggedIn ? (
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center rounded-xl bg-[#CC1111] px-8 py-3.5 font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
                >
                  {t("ouvirTrilhas")}
                </Link>
                <Link
                  href="/encomenda"
                  className="inline-flex items-center justify-center rounded-xl border border-[#333] px-8 py-3.5 font-semibold text-white transition-colors hover:border-[#555]"
                >
                  {t("pedirPersonalizada")}
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-6 flex justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#CC1111]/30 bg-[#CC1111]/10 px-4 py-1.5 text-sm text-white">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#CC1111"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                      aria-hidden="true"
                    >
                      <rect x="3" y="8" width="18" height="4" rx="1" />
                      <path d="M12 8v13" />
                      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8" />
                      <path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" />
                    </svg>
                    {t("gratisHook")}
                  </span>
                </div>
              </>
            )}

            {/* Stats */}
            <div className="mt-16 border-t border-[#1a1a1a] pt-12">
              <p className="text-center text-base font-semibold text-white sm:text-lg">
                {t("alcanceLinha")}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                <ProofPill>{t("beneficioCopyright")}</ProofPill>
                <ProofPill>{t("beneficioPrevia")}</ProofPill>
                <ProofPill>{t("beneficioNovas")}</ProofPill>
              </div>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="border-t border-[#1a1a1a] px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#555]">
              {t("processoLabel")}
            </p>
            <h2 className="mt-2 text-center text-3xl font-black text-white md:text-4xl">
              {t("processoTitulo")}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <InfoCard number={1} title={t("passo1Titulo")} description={t("passo1Desc")} />
              <InfoCard number={2} title={t("passo2Titulo")} description={t("passo2Desc")} />
              <InfoCard number={3} title={t("passo3Titulo")} description={t("passo3Desc")} />
            </div>
          </div>
        </section>

        {/* Catálogo (prévia) */}
        <section className="border-t border-[#1a1a1a] px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#555]">
                  {t("catalogoLabel")}
                </p>
                <h2 className="mt-1 text-3xl font-black text-white md:text-4xl">
                  {t("catalogoTitulo")}
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="rounded-xl bg-[#CC1111] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
              >
                {t("verCatalogoCompleto")}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {tracks.length > 0
                ? tracks.map((track, index) => (
                    <TrackCard
                      key={track.id}
                      title={track.title}
                      brand={track.brand}
                      gradient={GRADIENTS[index % GRADIENTS.length]}
                      coverUrl={
                        track.cover_path ? getCoverUrl(track.cover_path) : null
                      }
                      audioPath={track.audio_path}
                      previewUrl={previewMap[track.audio_path] ?? null}
                      inclusoLabel={t("inclusoAssinatura")}
                    />
                  ))
                : DEMO_TRACKS.map((track) => (
                    <TrackCard
                      key={track.title}
                      {...track}
                      inclusoLabel={t("inclusoAssinatura")}
                    />
                  ))}
            </div>
          </div>
        </section>

        {/* Planos (resumo) */}
        <section className="border-t border-[#1a1a1a] px-6 py-16 text-center sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-black text-white md:text-4xl">
              {t("planosTitulo")}
            </h2>
            <p className="mt-3 text-[#888]">{t("planosSubtitulo")}</p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {PLANS.map((plan) => {
                const preco = getPlanPreco(plan, locale);
                return (
                  <Link
                    key={plan.id}
                    href="/planos"
                    className={`rounded-2xl border p-6 transition-colors ${
                      plan.popular
                        ? "border-[#CC1111] bg-gradient-to-b from-[#1a0808] to-[#111]"
                        : "border-[#1a1a1a] bg-[#111] hover:border-[#555]"
                    }`}
                  >
                    {plan.popular && (
                      <span className="rounded-full bg-[#CC1111] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                        {t("popular")}
                      </span>
                    )}
                    <p className="mt-2 text-sm font-medium text-[#888]">
                      {plan.name}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-white">
                      {preco.label}
                      <span className="text-sm font-normal text-[#888]">
                        {t("porMes")}
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-[#888]">
                      {plan.downloadLimit === null
                        ? t("downloadsIlimitados")
                        : t("downloadsLimite", { limite: plan.downloadLimit })}
                    </p>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/planos"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#CC1111] px-8 py-3.5 font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
            >
              {t("verDetalhesPlanos")}
            </Link>
          </div>
        </section>

        <Depoimentos />

        {/* CTA final */}
        {!isLoggedIn && (
          <section className="border-t border-[#1a1a1a] bg-[#111] px-6 py-12 text-center">
            <h2 className="text-2xl font-bold text-white">
              {t("ctaFinalTitulo")}
            </h2>
            <p className="mt-2 text-[#888]">{t("ctaFinalDesc")}</p>
            <Link
              href="/cadastro"
              className="mt-6 inline-flex rounded-xl bg-[#CC1111] px-8 py-3.5 font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
            >
              {t("criarConta")}
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

function ProofPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1a1a1a] bg-[#111] px-4 py-2 text-sm text-[#ccc]">
      <span className="text-[#CC1111]">●</span> {children}
    </span>
  );
}

function TrackCard({
  title,
  brand,
  gradient,
  coverUrl,
  audioPath,
  previewUrl,
  inclusoLabel,
}: {
  title: string;
  brand: string;
  gradient: string;
  coverUrl?: string | null;
  audioPath?: string;
  previewUrl?: string | null;
  inclusoLabel: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#111] transition-colors hover:border-[#CC1111]">
      <div
        className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden`}
      >
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18V5l12-2v13"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="1.5" opacity="0.8" />
            <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="1.5" opacity="0.8" />
          </svg>
        )}

        {audioPath && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <TrackPreviewPlayer
              track={{
                id: audioPath,
                title,
                brand,
                coverUrl: coverUrl ?? null,
                audioPath,
                previewUrl,
              }}
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="text-sm font-bold leading-tight text-white">
            {title}
          </p>
          <span className="mt-1 inline-block rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-0.5 text-[11px] text-[#888]">
            {brand}
          </span>
        </div>
        <span className="mt-auto pt-2 text-xs font-semibold text-[#CC1111]">
          {inclusoLabel}
        </span>
      </div>
    </div>
  );
}

function InfoCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1a1a1a] bg-[#111] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#CC1111] text-xl font-black text-white">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#555]">{description}</p>
    </div>
  );
}
