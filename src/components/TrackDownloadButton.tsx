"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { baixarTrack } from "@/app/[locale]/catalogo/actions";

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
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
      router.push("/planos");
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
    </div>
  );
}

