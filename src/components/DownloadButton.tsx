"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { gerarLinkDownload } from "@/app/[locale]/conta/actions";

export default function DownloadButton({
  audioPath,
  title,
}: {
  audioPath: string;
  title: string;
}) {
  const t = useTranslations("conta");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleClick() {
    setStatus("loading");
    const result = await gerarLinkDownload(audioPath, title);
    if (result.url) {
      window.location.href = result.url;
      setStatus("idle");
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-lg border border-[#333] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#555] disabled:opacity-60"
      >
        {status === "loading" ? t("gerandoLink") : t("baixar")}
      </button>
      {status === "error" && (
        <span className="text-xs text-[#CC1111]">{t("erroGerarLink")}</span>
      )}
    </div>
  );
}

