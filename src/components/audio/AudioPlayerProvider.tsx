"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gerarPreviewUrl } from "@/app/[locale]/catalogo/preview-actions";
import MiniPlayer from "./MiniPlayer";

const PREVIEW_SECONDS = 60;

export interface PlayerTrack {
  id: string;
  title: string;
  brand: string;
  coverUrl: string | null;
  audioPath: string;
}

type Status = "idle" | "loading" | "playing" | "paused";

interface AudioContextValue {
  current: PlayerTrack | null;
  status: Status;
  progress: number;
  playTrack: (track: PlayerTrack) => void;
  toggle: () => void;
  stop: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudioPlayer() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudioPlayer precisa estar dentro do AudioPlayerProvider");
  }
  return ctx;
}

export default function AudioPlayerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PlayerTrack | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  function stop() {
    audioRef.current?.pause();
    audioRef.current = null;
    setStatus("idle");
    setProgress(0);
    setCurrent(null);
  }

  async function playTrack(track: PlayerTrack) {
    // Mesma faixa: só alterna play/pause.
    if (current?.id === track.id && audioRef.current) {
      toggle();
      return;
    }

    // Nova faixa: para a anterior e carrega o preview.
    audioRef.current?.pause();
    audioRef.current = null;
    setCurrent(track);
    setStatus("loading");
    setProgress(0);

    const result = await gerarPreviewUrl(track.audioPath);
    if (result.error || !result.url) {
      setStatus("idle");
      setCurrent(null);
      return;
    }

    const audio = new Audio(result.url);
    audio.addEventListener("timeupdate", () => {
      if (audio.currentTime >= PREVIEW_SECONDS) {
        audio.pause();
        audio.currentTime = 0;
        setProgress(0);
        return;
      }
      setProgress(audio.currentTime / PREVIEW_SECONDS);
    });
    audio.addEventListener("play", () => setStatus("playing"));
    audio.addEventListener("pause", () =>
      setStatus((s) => (s === "loading" ? s : "paused"))
    );
    audio.addEventListener("ended", () => {
      setStatus("idle");
      setProgress(0);
    });

    audioRef.current = audio;
    audio.play().catch(() => {});
  }

  return (
    <AudioContext.Provider
      value={{ current, status, progress, playTrack, toggle, stop }}
    >
      <div className={`flex flex-1 flex-col ${current ? "pb-24" : ""}`}>
        {children}
      </div>
      <MiniPlayer />
    </AudioContext.Provider>
  );
}
