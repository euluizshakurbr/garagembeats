"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import type { Locale } from "@/i18n/request";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      setLocale(next);
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[#2a2a2a] p-0.5 text-xs font-semibold">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleChange("pt")}
        className={`rounded-md px-2 py-1 transition-colors ${
          locale === "pt" ? "bg-[#CC1111] text-white" : "text-[#888] hover:text-white"
        }`}
      >
        PT
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleChange("en")}
        className={`rounded-md px-2 py-1 transition-colors ${
          locale === "en" ? "bg-[#CC1111] text-white" : "text-[#888] hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}
