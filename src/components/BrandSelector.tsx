"use client";

import { useId, useState } from "react";

// Seletor de marcas com múltipla seleção. Sugere as marcas já existentes
// (datalist) e permite adicionar novas. Aprende sozinho conforme o catálogo cresce.
export default function BrandSelector({
  value,
  onChange,
  options,
  placeholder = "Digite ou escolha uma marca",
}: {
  value: string[];
  onChange: (brands: string[]) => void;
  options: string[];
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const listId = useId();

  function add(raw: string) {
    const b = raw.trim();
    if (!b) return;
    if (!value.some((v) => v.toLowerCase() === b.toLowerCase())) {
      onChange([...value, b]);
    }
    setInput("");
  }

  function remove(b: string) {
    onChange(value.filter((v) => v !== b));
  }

  const disponiveis = options.filter(
    (o) => !value.some((v) => v.toLowerCase() === o.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#CC1111]/15 px-2.5 py-1 text-xs font-semibold text-white"
            >
              {b}
              <button
                type="button"
                onClick={() => remove(b)}
                aria-label={`Remover ${b}`}
                className="text-[#CC1111] transition-colors hover:text-white"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          list={listId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(input);
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none focus:border-[#CC1111]"
        />
        <datalist id={listId}>
          {disponiveis.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={() => add(input)}
          className="shrink-0 rounded-xl border border-[#333] px-4 text-sm font-semibold text-white transition-colors hover:border-[#555]"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
