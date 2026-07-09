"use client";

import { useEffect, useRef, useState } from "react";
import { gerarPreviewUrl } from "@/app/[locale]/catalogo/preview-actions";
import { registerPlayingAudio, unregisterPlayingAudio } from "@/lib/audioController";

const PREVIEW_SECONDS = 60;

export default function TrackPreviewPlayer({
  audioPath,
  className = "",
}: {
  audioPath: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">(
    "idle"
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        unregisterPlayingAudio(audioRef.current);
      }
    };
  }, []);

  async function handleClick() {
    if (status === "playing") {
      audioRef.current?.pause();
      setStatus("idle");
      return;
    }

    if (audioRef.current) {
      registerPlayingAudio(audioRef.current, () => {
        audioRef.current?.pause();
        setStatus("idle");
      });
      audioRef.current.play().catch(() => {});
      setStatus("playing");
      return;
    }

    setStatus("loading");
    const result = await gerarPreviewUrl(audioPath);
    if (result.error || !result.url) {
      setStatus("error");
      return;
    }

    const audio = new Audio(result.url);
    audio.addEventListener("timeupdate", () => {
      if (audio.currentTime >= PREVIEW_SECONDS) {
        audio.pause();
        return;
      }
      setProgress(audio.currentTime / PREVIEW_SECONDS);
    });
    audio.addEventListener("ended", () => {
      setStatus("idle");
      unregisterPlayingAudio(audio);
    });
    audio.addEventListener("pause", () => setStatus("idle"));
    audio.addEventListener("play", () => setStatus("playing"));
    audioRef.current = audio;
    registerPlayingAudio(audio, () => {
      audio.pause();
      setStatus("idle");
    });
    audio.play().catch(() => {});
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        aria-label={status === "playing" ? "Pausar preview" : "Ouvir preview"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#CC1111] text-white shadow-lg transition-colors hover:bg-[#aa0e0e] disabled:opacity-60"
      >
        {status === "loading" ? (
          <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
        ) : status === "playing" ? (
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

      {status === "playing" && (
        <div className="h-1 w-16 overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full bg-white transition-[width] duration-200"
            style={{ width: `${Math.min(progress, 1) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

