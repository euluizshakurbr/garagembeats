"use client";

import { useTranslations } from "next-intl";
import { useAudioPlayer, type PlayerTrack } from "@/components/audio/AudioPlayerProvider";

export default function TrackPreviewPlayer({
  track,
  className = "",
  full = false,
}: {
  track: PlayerTrack;
  className?: string;
  full?: boolean;
}) {
  const t = useTranslations("catalogo");
  const { current, status, playTrack } = useAudioPlayer();

  const isCurrent = current?.id === track.id;
  const isPlaying = isCurrent && status === "playing";
  const isLoading = isCurrent && status === "loading";

  const icon = isLoading ? (
    <span className="h-3 w-3 animate-pulse rounded-full bg-current" />
  ) : isPlaying ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3l14 9-14 9V3z" />
    </svg>
  );

  // Modo "botão com texto" (usado no corpo do card, acima do baixar)
  if (full) {
    return (
      <button
        type="button"
        onClick={() => playTrack(track)}
        disabled={isLoading}
        className={`flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#333] px-2 py-2 text-xs font-semibold text-white transition-colors hover:border-[#555] disabled:opacity-60 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${className}`}
      >
        {icon} {isPlaying ? t("pausarPrevia") : t("ouvirPreviaBtn")}
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={() => playTrack(track)}
        disabled={isLoading}
        aria-label={isPlaying ? "Pausar preview" : "Ouvir preview"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CC1111] text-white shadow-lg transition-colors hover:bg-[#aa0e0e] disabled:opacity-60"
      >
        {icon}
      </button>
    </div>
  );
}
