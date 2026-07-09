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
}: {
  trackId: string;
  audioPath: string;
  title: string;
  isLoggedIn: boolean;
}) {
  const t = useTranslations("catalogo");
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    if (!isLoggedIn) {
      router.push({ pathname: "/login", query: { next: "/catalogo" } });
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
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-lg bg-[#CC1111] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:opacity-60"
      >
        {status === "loading" ? t("gerando") : t("baixar")}
      </button>
      {status === "error" && (
        <span className="max-w-[140px] text-right text-[11px] text-[#CC1111]">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

