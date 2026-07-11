"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Cropper from "react-easy-crop";
import { subirMusica } from "@/app/[locale]/admin/actions";
import { createClient } from "@/lib/supabase/client";
import { ESTILOS } from "@/lib/estilos";
import { compressImage } from "@/lib/compressImage";
import { getCroppedImage, type Area } from "@/lib/cropImage";
import BrandSelector from "@/components/BrandSelector";

export default function UploadTrackForm({
  brandOptions,
}: {
  brandOptions: string[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [duration, setDuration] = useState<number | null>(null);

  // Capa + recorte
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

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

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (coverSrc) URL.revokeObjectURL(coverSrc);
    if (!file) {
      setCoverSrc(null);
      return;
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setCoverSrc(URL.createObjectURL(file));
  }

  function limparCapa() {
    if (coverSrc) URL.revokeObjectURL(coverSrc);
    setCoverSrc(null);
    setCroppedArea(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "");
    const estilo = String(formData.get("estilo") || "");
    const audioFile = formData.get("audio") as File | null;

    if (!title || brands.length === 0 || !audioFile || audioFile.size === 0) {
      setStatus("error");
      setErrorMessage("Preencha o título, ao menos uma marca e o áudio.");
      return;
    }

    const supabase = createClient();

    // Áudio direto pro Storage (sem passar pelo servidor Next).
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

    // Capa (opcional): usa o recorte quadrado que o admin posicionou.
    let coverPath: string | null = null;
    if (coverSrc && croppedArea) {
      try {
        const recortada = await getCroppedImage(coverSrc, croppedArea);
        const comprimida = await compressImage(recortada);
        coverPath = `${crypto.randomUUID()}.jpg`;
        const { error: coverError } = await supabase.storage
          .from("tracks-covers")
          .upload(coverPath, comprimida);
        if (coverError) {
          setStatus("error");
          setErrorMessage(`Falha ao enviar a capa: ${coverError.message}`);
          return;
        }
      } catch {
        setStatus("error");
        setErrorMessage("Falha ao processar a capa.");
        return;
      }
    }

    const result = await subirMusica({
      title,
      brands,
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
    setBrands([]);
    limparCapa();
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
          <input id="title" name="title" type="text" required placeholder="Ex: Turbo Rush" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white">Marca(s)/tag</label>
          <BrandSelector
            value={brands}
            onChange={setBrands}
            options={brandOptions}
          />
          <p className="text-xs text-[#888]">
            Escolha uma ou mais (ex: veículo Scania + Volkswagen).
          </p>
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
          <input id="audio" name="audio" type="file" accept="audio/*" required onChange={handleAudioChange} className={inputClass} />
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
            Escolha a imagem e posicione o carro dentro do quadrado (arraste e
            use o zoom). É assim que a capa vai aparecer no card.
          </p>
          <input
            id="cover"
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className={inputClass}
          />

          {coverSrc && (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0A0A0A]">
                <Cropper
                  image={coverSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, area) => setCroppedArea(area)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#888]">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full max-w-[220px] accent-[#CC1111]"
                />
                <button
                  type="button"
                  onClick={limparCapa}
                  className="w-fit text-xs text-[#888] underline-offset-2 hover:text-white hover:underline"
                >
                  Remover capa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {status === "error" && (
        <p className="mt-4 text-sm text-[#CC1111]">{errorMessage}</p>
      )}
      {status === "done" && (
        <p className="mt-4 text-sm text-[#888]">Música adicionada ao catálogo.</p>
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
