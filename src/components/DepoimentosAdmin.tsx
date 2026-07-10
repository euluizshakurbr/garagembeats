"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  adicionarDepoimento,
  excluirDepoimento,
} from "@/app/[locale]/admin/depoimentos/actions";
import type { Depoimento } from "@/lib/types";

export default function DepoimentosAdmin({
  depoimentos,
}: {
  depoimentos: Depoimento[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [erro, setErro] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErro("");

    const fd = new FormData(event.currentTarget);
    const notaRaw = fd.get("nota") as string;
    const result = await adicionarDepoimento({
      nome: String(fd.get("nome") || ""),
      carro: String(fd.get("carro") || ""),
      texto: String(fd.get("texto") || ""),
      nota: notaRaw ? Number(notaRaw) : null,
    });

    if (result.error) {
      setStatus("error");
      setErro(result.error);
      return;
    }
    formRef.current?.reset();
    setStatus("idle");
  }

  return (
    <div className="mt-8">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#1a1a1a] bg-[#111] p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="nome" required placeholder="Nome do cliente" className={inputClass} />
          <input name="carro" placeholder="Carro (opcional)" className={inputClass} />
        </div>
        <textarea
          name="texto"
          required
          rows={3}
          placeholder="Depoimento..."
          className={`${inputClass} mt-3 w-full`}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select name="nota" defaultValue="5" className={inputClass}>
            <option value="">Sem nota</option>
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★ (4)</option>
            <option value="3">★★★ (3)</option>
            <option value="2">★★ (2)</option>
            <option value="1">★ (1)</option>
          </select>
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-xl bg-[#CC1111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#aa0e0e] disabled:opacity-60"
          >
            {status === "loading" ? "Salvando..." : "Adicionar depoimento"}
          </button>
          {status === "error" && <span className="text-sm text-[#CC1111]">{erro}</span>}
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">
          Depoimentos ({depoimentos.length})
        </h2>
        {depoimentos.length === 0 ? (
          <p className="mt-4 text-sm text-[#555]">Nenhum depoimento ainda.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {depoimentos.map((d) => (
              <Item key={d.id} depoimento={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Item({ depoimento }: { depoimento: Depoimento }) {
  const [busy, setBusy] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  async function excluir() {
    setBusy(true);
    await excluirDepoimento(depoimento.id);
    // revalidação remove da lista
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-[#1a1a1a] bg-[#111] p-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">
          {depoimento.nome}
          {depoimento.carro ? (
            <span className="font-normal text-[#888]"> · {depoimento.carro}</span>
          ) : null}
          {depoimento.nota ? (
            <span className="ml-2 text-[#CC1111]">
              {"★".repeat(depoimento.nota)}
            </span>
          ) : null}
        </p>
        <p className="mt-1 text-sm text-[#888]">{depoimento.texto}</p>
      </div>
      {confirmar ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={excluir}
            disabled={busy}
            className="rounded-lg bg-[#CC1111] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#aa0e0e] disabled:opacity-60"
          >
            {busy ? "..." : "Sim"}
          </button>
          <button
            onClick={() => setConfirmar(false)}
            className="rounded-lg border border-[#333] px-3 py-1.5 text-xs font-semibold text-[#888] hover:text-white"
          >
            Não
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmar(true)}
          className="shrink-0 rounded-lg border border-[#CC1111]/40 px-3 py-1.5 text-xs font-semibold text-[#CC1111] hover:bg-[#CC1111]/10"
        >
          Excluir
        </button>
      )}
    </div>
  );
}

const inputClass =
  "rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none focus:border-[#CC1111]";
