import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { alternates } from "@/i18n/seo";
import SiteHeader from "@/components/SiteHeader";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("sobre");
  return {
    title: t("label"),
    description: t("subtitulo"),
    alternates: alternates("/sobre", locale),
  };
}

export default async function SobrePage() {
  const t = await getTranslations("sobre");

  const valores = [
    { t: t("v1t"), d: t("v1d"), icon: TrackIcon },
    { t: t("v2t"), d: t("v2d"), icon: ShieldIcon },
    { t: t("v3t"), d: t("v3d"), icon: SparkIcon },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-[#1a1a1a] bg-[#111] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#888]">
            {t("label")}
          </span>
          <h1 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            {t("titulo")}
          </h1>
          <p className="mt-3 text-lg text-[#888]">{t("subtitulo")}</p>

          <div className="mt-8 flex flex-col gap-4 text-[#ccc]">
            <p>{t("p1")}</p>
            <p>{t("p2")}</p>
            <p>{t("p3")}</p>
          </div>

          <h2 className="mt-14 text-lg font-semibold text-white">
            {t("valoresTitulo")}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {valores.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.t}
                  className="rounded-2xl border border-[#1a1a1a] bg-[#111] p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CC1111]/10">
                    <Icon />
                  </div>
                  <p className="mt-3 font-semibold text-white">{v.t}</p>
                  <p className="mt-1 text-sm text-[#888]">{v.d}</p>
                </div>
              );
            })}
          </div>

          <p className="mt-10 text-sm text-[#555]">{t("empresa")}</p>

          <div className="mt-12 rounded-2xl border border-[#CC1111]/40 bg-gradient-to-b from-[#1a0808] to-[#111] p-8 text-center">
            <h2 className="text-2xl font-bold text-white">{t("ctaTitulo")}</h2>
            <Link
              href="/catalogo"
              className="mt-5 inline-flex rounded-xl bg-[#CC1111] px-8 py-3.5 font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
            >
              {t("ctaBotao")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function TrackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC1111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC1111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CC1111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  );
}
