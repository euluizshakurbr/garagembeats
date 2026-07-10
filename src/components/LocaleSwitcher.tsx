"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: (typeof routing.locales)[number]) {
    if (next === locale) return;
    startTransition(() => {
      // Mantém a mesma página, apenas troca o locale (e o slug traduzido).
      // Passa os params junto para funcionar também em rotas dinâmicas
      // (ex: /musica/[id]).
      router.replace(
        { pathname, params } as Parameters<typeof router.replace>[0],
        { locale: next }
      );
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
