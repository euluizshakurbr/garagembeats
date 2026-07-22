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

export interface PlayerTrack {
  id: string;
  title: string;
  brand: string;
  coverUrl: string | null;
  audioPath: string;
  previewUrl?: string | null;
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

    // Usa o link pré-assinado (entregue com a faixa) pra tocar na hora.
    // Só chama o servidor se ele não veio pronto.
    let url = track.previewUrl ?? null;
    if (!url) {
      const result = await gerarPreviewUrl(track.audioPath);
      if (result.error || !result.url) {
        setStatus("idle");
        setCurrent(null);
        return;
      }
      url = result.url;
    }

    const audio = new Audio(url);
    // Se o link pré-assinado tiver expirado, regenera e tenta de novo.
    let jaRegenerou = false;
    audio.addEventListener("error", async () => {
      if (audioRef.current !== audio || jaRegenerou) return;
      jaRegenerou = true;
      const result = await gerarPreviewUrl(track.audioPath);
      if (result.url && audioRef.current === audio) {
        audio.src = result.url;
        audio.play().catch(() => {});
      }
    });
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
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
