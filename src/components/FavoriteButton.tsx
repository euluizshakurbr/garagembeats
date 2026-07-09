"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toggleFavorito } from "@/app/[locale]/catalogo/favorites-actions";

export default function FavoriteButton({
  trackId,
  initialFavorited,
  isLoggedIn,
}: {
  trackId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
}) {
  const t = useTranslations("catalogo");
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!isLoggedIn) {
      router.push({ pathname: "/login", query: { next: "/catalogo" } });
      return;
    }

    setBusy(true);
    const result = await toggleFavorito(trackId, favorited);
    if (result.ok) setFavorited(result.favorited!);
    setBusy(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-label={favorited ? t("removerFavoritos") : t("favoritar")}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 disabled:opacity-60"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={favorited ? "#CC1111" : "none"}
        stroke={favorited ? "#CC1111" : "white"}
        strokeWidth="2"
      >
        <path d="M12 21s-7.5-4.5-9.5-9C1 7.5 3 4 6.5 4c2 0 3.5 1.2 4.5 2.5C12 5.2 13.5 4 15.5 4 19 4 21 7.5 21.5 12c-2 4.5-9.5 9-9.5 9z" />
      </svg>
    </button>
  );
}

