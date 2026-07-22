"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { baixarTrack, comprarAvulsa } from "@/app/[locale]/catalogo/actions";
import { getAvulsaPreco } from "@/lib/plans";

export default function TrackDownloadButton({
  trackId,
  audioPath,
  title,
  isLoggedIn,
  full = false,
  label,
}: {
  trackId: string;
  audioPath: string;
  title: string;
  isLoggedIn: boolean;
  full?: boolean;
  label?: string;
}) {
  const t = useTranslations("catalogo");
  const locale = useLocale();
  const avulsaPreco = getAvulsaPreco(locale).label;
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showOpcoesModal, setShowOpcoesModal] = useState(false);

  async function handleClick() {
    if (!isLoggedIn) {
      // Manda pro cadastro (a maioria é gente nova vinda dos vídeos) e guarda
      // a página atual pra devolver a pessoa exatamente pra esta música.
      const next =
        typeof window !== "undefined" ? window.location.pathname : "/catalogo";
      router.push({ pathname: "/cadastro", query: { next } });
      return;
    }

    setStatus("loading");
    const result = await baixarTrack(trackId, audioPath, title);

    if (result.needsPlan) {
      setStatus("idle");
      setShowOpcoesModal(true);
      return;
    }

    if (result.error) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    window.location.href = result.url!;
    setStatus("idle");
  }

  async function handleComprarAvulsa() {
    setStatus("loading");
    const result = await comprarAvulsa(trackId, title);

    if (result.error) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    window.location.href = result.checkoutUrl!;
  }

  return (
    <div className={`flex flex-col gap-1 ${full ? "w-full items-stretch" : "items-end"}`}>
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className={`flex items-center justify-center gap-2 rounded-xl bg-[#CC1111] font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:opacity-60 ${
          full ? "w-full px-6 py-3 text-sm" : "rounded-lg px-3 py-1.5 text-xs"
        }`}
      >
        {full && status !== "loading" && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
        {status === "loading" ? t("gerando") : label ?? t("baixar")}
      </button>
      {status === "error" && (
        <span className={`text-[11px] text-[#CC1111] ${full ? "text-center" : "max-w-[140px] text-right"}`}>
          {errorMessage}
        </span>
      )}

      {showOpcoesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setShowOpcoesModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-[#1a1a1a] bg-[#111] p-6 shadow-2xl">
            <button
              onClick={() => setShowOpcoesModal(false)}
              aria-label={t("fechar")}
              className="absolute right-4 top-4 text-[#888] hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <h2 className="pr-6 text-lg font-semibold text-white">{t("modalTitulo")}</h2>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/planos"
                className="flex flex-col rounded-xl bg-[#CC1111] px-4 py-3 text-left font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
              >
                <span className="text-sm">{t("modalAssinarPlano")}</span>
                <span className="text-xs font-normal opacity-80">{t("modalAssinarPlanoDesc")}</span>
              </Link>

              <button
                onClick={handleComprarAvulsa}
                disabled={status === "loading"}
                className="flex flex-col rounded-xl border border-[#333] px-4 py-3 text-left font-semibold text-white transition-colors hover:border-[#555] disabled:opacity-60"
              >
                <span className="text-sm">{t("modalComprarAvulsa")}</span>
                <span className="text-xs font-normal text-[#888]">
                  {t("modalComprarAvulsaDesc", { preco: avulsaPreco })}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

