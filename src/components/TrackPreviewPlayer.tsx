"use client";

import { useAudioPlayer, type PlayerTrack } from "@/components/audio/AudioPlayerProvider";

export default function TrackPreviewPlayer({
  track,
  className = "",
}: {
  track: PlayerTrack;
  className?: string;
}) {
  const { current, status, playTrack } = useAudioPlayer();

  const isCurrent = current?.id === track.id;
  const isPlaying = isCurrent && status === "playing";
  const isLoading = isCurrent && status === "loading";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={() => playTrack(track)}
        disabled={isLoading}
        aria-label={isPlaying ? "Pausar preview" : "Ouvir preview"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CC1111] text-white shadow-lg transition-colors hover:bg-[#aa0e0e] disabled:opacity-60"
      >
        {isLoading ? (
          <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
        ) : isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        )}
      </button>
    </div>
  );
}
