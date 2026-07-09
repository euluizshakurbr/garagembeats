"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { subirMusica } from "@/app/[locale]/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { ESTILOS } from "@/lib/estilos";
import { compressImage } from "@/lib/compressImage";

export default function UploadTrackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [duration, setDuration] = useState<number | null>(null);

  function handleAudioChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setDuration(null);
      return;
    }

    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      setDuration(Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    };
    audio.src = URL.createObjectURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "");
    const brand = String(formData.get("brand") || "");
    const estilo = String(formData.get("estilo") || "");
    const audioFile = formData.get("audio") as File | null;
    const coverFile = formData.get("cover") as File | null;

    if (!title || !brand || !audioFile || audioFile.size === 0) {
      setStatus("error");
      setErrorMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    const supabase = createClient();

    // Envia o áudio DIRETO pro Supabase Storage (sem passar pelo servidor Next,
    // que tem limite de 20MB). O usuário é admin, então a RLS do bucket permite.
    const audioExt = audioFile.name.split(".").pop() || "mp3";
    const audioPath = `${crypto.randomUUID()}.${audioExt}`;
    const { error: audioError } = await supabase.storage
      .from("tracks-audio")
      .upload(audioPath, audioFile);
    if (audioError) {
      setStatus("error");
      setErrorMessage(`Falha ao enviar o áudio: ${audioError.message}`);
      return;
    }

    // Capa (opcional) — comprime e envia direto também.
    let coverPath: string | null = null;
    if (coverFile && coverFile.size > 0) {
      const compressed = await compressImage(coverFile);
      coverPath = `${crypto.randomUUID()}.jpg`;
      const { error: coverError } = await supabase.storage
        .from("tracks-covers")
        .upload(coverPath, compressed);
      if (coverError) {
        setStatus("error");
        setErrorMessage(`Falha ao enviar a capa: ${coverError.message}`);
        return;
      }
    }

    // Grava só os metadados no catálogo (payload pequeno).
    const result = await subirMusica({
      title,
      brand,
      estilo,
      audioPath,
      coverPath,
      duration,
    });

    if (result.error) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }

    setStatus("done");
    formRef.current?.reset();
    setDuration(null);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#1a1a1a] bg-[#111] p-6 sm:p-8"
    >
      <input type="hidden" name="duration" value={duration ?? ""} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-white">
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Ex: Turbo Rush"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="brand" className="text-sm font-medium text-white">
            Marca/tag
          </label>
          <input
            id="brand"
            name="brand"
            type="text"
            required
            placeholder="Ex: Volkswagen"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="estilo" className="text-sm font-medium text-white">
            Estilo musical (opcional)
          </label>
          <select id="estilo" name="estilo" className={inputClass}>
            <option value="">Não sei / sem estilo definido</option>
            {ESTILOS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="audio" className="text-sm font-medium text-white">
            Arquivo de áudio (MP3)
          </label>
          <input
            id="audio"
            name="audio"
            type="file"
            accept="audio/*"
            required
            onChange={handleAudioChange}
            className={inputClass}
          />
          {duration !== null && (
            <p className="text-xs text-[#888]">
              Duração detectada: {Math.floor(duration / 60)}:
              {String(duration % 60).padStart(2, "0")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="cover" className="text-sm font-medium text-white">
            Capa (opcional)
          </label>
          <p className="text-xs text-[#888]">
            Pode subir em qualquer tamanho — a imagem é redimensionada e
            comprimida automaticamente antes do upload.
          </p>
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/*"
            className={inputClass}
          />
        </div>
      </div>

      {status === "error" && (
        <p className="mt-4 text-sm text-[#CC1111]">{errorMessage}</p>
      )}
      {status === "done" && (
        <p className="mt-4 text-sm text-[#888]">
          Música adicionada ao catálogo.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 rounded-xl bg-[#CC1111] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Adicionar ao catálogo"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-2.5 text-white placeholder-[#555] outline-none transition-colors focus:border-[#CC1111]";

