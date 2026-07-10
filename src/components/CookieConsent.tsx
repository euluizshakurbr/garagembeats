"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MetaPixel from "@/components/MetaPixel";

const CHAVE = "cookie-consent";

export default function CookieConsent({
  gaId,
  metaPixelId,
}: {
  gaId?: string;
  metaPixelId?: string;
}) {
  const t = useTranslations("cookies");
  const [consent, setConsent] = useState<
    "accepted" | "refused" | "pending" | "loading"
  >("loading");

  useEffect(() => {
    const stored = localStorage.getItem(CHAVE);
    setConsent(
      stored === "accepted" ? "accepted" : stored === "refused" ? "refused" : "pending"
    );
  }, []);

  function decidir(valor: "accepted" | "refused") {
    localStorage.setItem(CHAVE, valor);
    setConsent(valor);
  }

  return (
    <>
      {consent === "accepted" && gaId && <GoogleAnalytics gaId={gaId} />}
      {consent === "accepted" && metaPixelId && <MetaPixel pixelId={metaPixelId} />}

      {consent === "pending" && (
        <div className="fixed inset-x-0 bottom-0 z-[60] p-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-[#2a2a2a] bg-[#111] p-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#ccc]">
              {t("mensagem")}{" "}
              <Link
                href="/privacidade"
                className="text-white underline underline-offset-2 hover:text-[#CC1111]"
              >
                {t("saibaMais")}
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decidir("refused")}
                className="rounded-xl border border-[#333] px-4 py-2 text-sm font-semibold text-[#888] transition-colors hover:text-white"
              >
                {t("recusar")}
              </button>
              <button
                type="button"
                onClick={() => decidir("accepted")}
                className="rounded-xl bg-[#CC1111] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
              >
                {t("aceitar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
