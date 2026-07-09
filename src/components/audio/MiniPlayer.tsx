"use client";

import { useAudioPlayer } from "./AudioPlayerProvider";

export default function MiniPlayer() {
  const { current, status, progress, toggle, stop } = useAudioPlayer();
  if (!current) return null;

  const isPlaying = status === "playing";
  const isLoading = status === "loading";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#1a1a1a] bg-[#0d0d0d]/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#1a0000] to-[#3a0a0a]">
          {current.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.coverUrl}
              alt={current.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18V5l12-2v13"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
              <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="1.5" opacity="0.7" />
              <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="1.5" opacity="0.7" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {current.title}
          </p>
          <p className="truncate text-xs text-[#888]">{current.brand}</p>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-[#CC1111] transition-[width] duration-200"
              style={{ width: `${Math.min(progress, 1) * 100}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={isLoading}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#CC1111] text-white transition-colors hover:bg-[#aa0e0e] disabled:opacity-60"
        >
          {isLoading ? (
            <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
          ) : isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={stop}
          aria-label="Fechar player"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#888] transition-colors hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
