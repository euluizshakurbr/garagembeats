"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { assinarPlano } from "@/app/[locale]/planos/actions";
import { getPlan, getPlanPreco } from "@/lib/plans";
import { trackMeta } from "@/lib/meta";

export default function SubscribeButton({
  planId,
  isLoggedIn,
  isCurrent,
  highlighted,
}: {
  planId: string;
  isLoggedIn: boolean;
  isCurrent: boolean;
  highlighted?: boolean;
}) {
  const t = useTranslations("planos");
  const locale = useLocale();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleClick() {
    if (!isLoggedIn) {
      router.push({ pathname: "/login", query: { next: "/planos" } });
      return;
    }

    setStatus("loading");
    const result = await assinarPlano(planId);
    if (result.error || !result.checkoutUrl) {
      setStatus("error");
      return;
    }

    const plan = getPlan(planId);
    if (plan) {
      const preco = getPlanPreco(plan, locale);
      trackMeta("InitiateCheckout", {
        value: preco.cents / 100,
        currency: preco.currency.toUpperCase(),
        content_type: "product",
        content_name: `Plano ${plan.name}`,
      });
    }

    window.location.href = result.checkoutUrl;
  }

  if (isCurrent) {
    return (
      <span className="inline-flex w-full items-center justify-center rounded-xl border border-[#CC1111] px-6 py-3 text-sm font-semibold text-[#CC1111]">
        {t("planoAtual")}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={handleClick}
        disabled={status === "loading"}
        variant={highlighted ? "default" : "outline"}
        className={`h-auto w-full rounded-xl px-6 py-3 text-sm font-semibold ${
          highlighted
            ? "bg-[#CC1111] hover:bg-[#aa0e0e]"
            : "border-[#333] text-white hover:border-[#555] hover:bg-transparent"
        }`}
      >
        {status === "loading" ? t("abrindoPagamento") : t("assinar")}
      </Button>
      {status === "error" && (
        <span className="text-center text-xs text-[#CC1111]">
          {t("erroAssinar")}
        </span>
      )}
    </div>
  );
}

