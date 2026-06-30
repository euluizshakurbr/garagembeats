"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ShareButton({ trackId }: { trackId: string }) {
  const t = useTranslations("catalogo");
  const [copiado, setCopiado] = useState(false);

  async function handleClick() {
    const url = `${window.location.origin}/catalogo?musica=${trackId}`;
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={t("compartilhar")}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
    >
      {copiado ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CC1111" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="M8.2 10.8l7.6-4.2M8.2 13.2l7.6 4.2" />
        </svg>
      )}
    </button>
  );
}
