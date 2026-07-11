"use client";

import { useState, type ChangeEvent } from "react";
import { subirMusica } from "@/app/[locale]/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { ESTILOS } from "@/lib/estilos";
import BrandSelector from "@/components/BrandSelector";

interface Item {
  file: File;
  title: string;
  duration: number | null;
}

export default function BatchUploadForm({
  brandOptions,
}: {
  brandOptions: string[];
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [estilo, setEstilo] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0, fail: 0 });
  const [erro, setErro] = useState("");

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const novos: Item[] = files.map((f) => ({
      file: f,
      title: f.name.replace(/\.[^.]+$/, ""),
      duration: null,
    }));
    setItems(novos);
    setStatus("idle");
    setErro("");

    // Detecta a duração de cada arquivo em segundo plano.
    novos.forEach((item, i) => {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, duration: Math.round(audio.duration) } : it
          )
        );
        URL.revokeObjectURL(audio.src);
      };
      audio.src = URL.createObjectURL(item.file);
    });
  }

  function setTitle(i: number, value: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, title: value } : it)));
  }

  function remover(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function enviarTodas() {
    if (items.length === 0) return;
    if (brands.length === 0) {
      setErro("Selecione ao menos uma marca (vale para todas).");
      return;
    }

    setStatus("uploading");
    setErro("");
    let done = 0;
    let fail = 0;
    setProgress({ done: 0, total: items.length, fail: 0 });

    const supabase = createClient();

    for (const item of items) {
      try {
        const ext = item.file.name.split(".").pop() || "mp3";
        const audioPath = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("tracks-audio")
          .upload(audioPath, item.file);
        if (upErr) {
          fail++;
        } else {
          const res = await subirMusica({
            title: item.title.trim() || item.file.name,
            brands,
            estilo,
            audioPath,
            coverPath: null,
            duration: item.duration,
          });
          if (res.error) fail++;
          else done++;
        }
      } catch {
        fail++;
      }
      setProgress({ done, total: items.length, fail });
    }

    setStatus("done");
    setItems([]);
  }

  return (
    <div className="rounded-2xl border border-[#1a1a1a] bg-[#111] p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white">
            Marca(s)/tag (para todas)
          </label>
          <BrandSelector
            value={brands}
            onChange={setBrands}
            options={brandOptions}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white">
            Estilo (para todas, opcional)
          </label>
          <select value={estilo} onChange={(e) => setEstilo(e.target.value)} className={inputClass}>
            <option value="">Sem estilo</option>
            {ESTILOS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <label className="text-sm font-medium text-white">
          Arquivos de áudio (MP3) — selecione vários
        </label>
        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFiles}
          className={inputClass}
        />
        <p className="text-xs text-[#888]">
          As capas você adiciona depois, editando cada música no catálogo.
        </p>
      </div>

      {items.length > 0 && (
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-sm font-semibold text-white">
            {items.length} música{items.length === 1 ? "" : "s"} selecionada
            {items.length === 1 ? "" : "s"}
          </p>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] p-2"
            >
              <input
                value={item.title}
                onChange={(e) => setTitle(i, e.target.value)}
                className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1.5 text-sm text-white outline-none"
              />
              {item.duration !== null && (
                <span className="shrink-0 text-xs text-[#555]">
                  {Math.floor(item.duration / 60)}:
                  {String(item.duration % 60).padStart(2, "0")}
                </span>
              )}
              <button
                type="button"
                onClick={() => remover(i)}
                disabled={status === "uploading"}
                aria-label="Remover"
                className="shrink-0 rounded-lg px-2 py-1 text-[#888] hover:text-white disabled:opacity-40"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {status === "uploading" && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
            <div
              className="h-full rounded-full bg-[#CC1111] transition-all"
              style={{
                width: `${
                  progress.total
                    ? ((progress.done + progress.fail) / progress.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="mt-2 text-sm text-[#888]">
            Enviando {progress.done + progress.fail} de {progress.total}...
          </p>
        </div>
      )}

      {status === "done" && (
        <p className="mt-4 text-sm text-[#888]">
          {progress.done} enviada{progress.done === 1 ? "" : "s"} com sucesso
          {progress.fail > 0 ? ` · ${progress.fail} falharam` : ""}.
        </p>
      )}

      {erro && <p className="mt-4 text-sm text-[#CC1111]">{erro}</p>}

      <button
        type="button"
        onClick={enviarTodas}
        disabled={status === "uploading" || items.length === 0}
        className="mt-6 rounded-xl bg-[#CC1111] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "uploading"
          ? "Enviando..."
          : `Enviar ${items.length || ""} música${items.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-2.5 text-white placeholder-[#555] outline-none transition-colors focus:border-[#CC1111]";
