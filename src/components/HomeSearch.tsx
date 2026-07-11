"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

// Busca do hero da home: manda a pessoa direto pro catálogo já filtrado.
export default function HomeSearch() {
  const t = useTranslations("home");
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const query = q.trim();
    router.push(
      query
        ? { pathname: "/catalogo", query: { search: query } }
        : { pathname: "/catalogo" }
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 flex w-full max-w-xl items-center gap-2"
    >
      <div className="relative flex-1">
        <svg
          className="absolute top-1/2 left-4 -translate-y-1/2"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#888"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("buscarCarroPlaceholder")}
          className="w-full rounded-2xl border border-[#2a2a2a] bg-[#111] py-3.5 pl-12 pr-4 text-base text-white outline-none transition-colors placeholder-[#666] focus:border-[#CC1111]"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-2xl bg-[#CC1111] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
      >
        {t("buscarCarroBtn")}
      </button>
    </form>
  );
}
