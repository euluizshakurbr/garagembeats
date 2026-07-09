"use client";

import { useState, type FormEvent } from "react";
import { editarMusica, excluirMusica } from "@/app/[locale]/admin/actions";
import { ESTILOS } from "@/lib/estilos";

interface AdminTrack {
  id: string;
  title: string;
  brand: string;
  estilo: string | null;
  coverUrl: string | null;
}

export default function AdminTrackItem({ track }: { track: AdminTrack }) {
  const [editing, setEditing] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");

  const [title, setTitle] = useState(track.title);
  const [brand, setBrand] = useState(track.brand);
  const [estilo, setEstilo] = useState(track.estilo ?? "");

  async function salvar(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErro("");
    const result = await editarMusica(track.id, { title, brand, estilo });
    setBusy(false);
    if (result.error) {
      setErro(result.error);
      return;
    }
    setEditing(false);
  }

  async function excluir() {
    setBusy(true);
    setErro("");
    const result = await excluirMusica(track.id);
    if (result.error) {
      setBusy(false);
      setErro(result.error);
      return;
    }
    // A revalidação remove o item da lista automaticamente.
  }

  if (editing) {
    return (
      <form
        onSubmit={salvar}
        className="flex flex-col gap-3 rounded-2xl border border-[#CC1111]/40 bg-[#111] p-4"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className={inputClass}
          />
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Marca"
            className={inputClass}
          />
          <select
            value={estilo}
            onChange={(e) => setEstilo(e.target.value)}
            className={inputClass}
          >
            <option value="">Sem estilo</option>
            {ESTILOS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {erro && <p className="text-sm text-[#CC1111]">{erro}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[#CC1111] px-4 py-2 text-sm font-semibold text-white hover:bg-[#aa0e0e] disabled:opacity-60"
          >
            {busy ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setErro("");
            }}
            className="rounded-lg border border-[#333] px-4 py-2 text-sm font-semibold text-[#888] hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#1a1a1a] bg-[#111] p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#1a0000] to-[#3a0a0a]">
        {track.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.coverUrl}
            alt={track.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="1.5" opacity="0.6" />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{track.title}</p>
        <p className="truncate text-xs text-[#888]">
          {track.brand}
          {track.estilo ? ` · ${track.estilo}` : ""}
        </p>
        {erro && <p className="mt-1 text-xs text-[#CC1111]">{erro}</p>}
      </div>

      {confirmando ? (
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-[#888]">Excluir?</span>
          <button
            type="button"
            onClick={excluir}
            disabled={busy}
            className="rounded-lg bg-[#CC1111] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#aa0e0e] disabled:opacity-60"
          >
            {busy ? "..." : "Sim"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="rounded-lg border border-[#333] px-3 py-1.5 text-xs font-semibold text-[#888] hover:text-white"
          >
            Não
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-[#333] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#555]"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="rounded-lg border border-[#CC1111]/40 px-3 py-1.5 text-xs font-semibold text-[#CC1111] hover:bg-[#CC1111]/10"
          >
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none focus:border-[#CC1111]";
