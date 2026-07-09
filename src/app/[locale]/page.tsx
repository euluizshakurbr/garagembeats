import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import TrackPreviewPlayer from "@/components/TrackPreviewPlayer";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Track } from "@/lib/types";
import { PLANS, getPlanPreco } from "@/lib/plans";
import {
  YouTubeIcon,
  TikTokIcon,
  KwaiIcon,
  InstagramIcon,
  FacebookIcon,
} from "@/components/icons";

const PLATFORMS = [
  { name: "YouTube", Icon: YouTubeIcon },
  { name: "TikTok", Icon: TikTokIcon },
  { name: "Kwai", Icon: KwaiIcon },
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

export default async function Home() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  let isLoggedIn = false;
  const tracks: Track[] = [];
  let getCoverUrl = (_path: string) => "";
  let totalTracks = 0;
  let totalDownloads = 0;
  let totalAssinantes = 0;

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

    const [{ count: tracksCount }, { count: downloadsCount }, { count: assinantesCount }] =
      await Promise.all([
        supabase.from("tracks").select("id", { count: "exact", head: true }),
        supabase.from("downloads").select("id", { count: "exact", head: true }),
        supabase
          .from("subscriptions")
          .select("user_id", { count: "exact", head: true })
          .eq("status", "active"),
      ]);
    totalTracks = tracksCount ?? 0;
    totalDownloads = downloadsCount ?? 0;
    totalAssinantes = assinantesCount ?? 0;
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

            {isLoggedIn ? (
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/cadastro"
                  className="inline-flex items-center justify-center rounded-xl bg-[#CC1111] px-8 py-3.5 font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
                >
                  {t("criarConta")}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-[#333] px-8 py-3.5 font-semibold text-white transition-colors hover:border-[#555]"
                >
                  {t("jaTenhoConta")}
                </Link>
              </div>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#555]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              {t("pagamentoSeguro")}
            </p>

            {/* Stats */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 border-t border-[#1a1a1a] pt-12">
              <Stat value={String(totalTracks)} label={t("statTrilhas")} />
              <Stat value={String(totalDownloads)} label={t("statDownloads")} />
              <Stat value={String(totalAssinantes)} label={t("statAssinantes")} />
              <Stat value="100%" label={t("statCopyright")} />
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

      <footer className="border-t border-[#1a1a1a] px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col-reverse items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-[#555]">
            {t("footerTagline")}
            <br />
            {t("footerCopyright", { ano: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#888]">
            <a
              href="https://wa.me/5500000000000"
              className="hover:text-white transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="https://instagram.com/garagembeats"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <Link href="/termos" className="hover:text-white transition-colors">
              {t("termosUso")}
            </Link>
            <Link
              href="/privacidade"
              className="hover:text-white transition-colors"
            >
              {t("privacidade")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm text-[#555]">{label}</div>
    </div>
  );
}

function TrackCard({
  title,
  brand,
  gradient,
  coverUrl,
  audioPath,
  inclusoLabel,
}: {
  title: string;
  brand: string;
  gradient: string;
  coverUrl?: string | null;
  audioPath?: string;
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
            <TrackPreviewPlayer audioPath={audioPath} />
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
