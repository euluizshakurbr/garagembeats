"use client";

import { useState } from "react";
import { pagarEncomenda } from "@/app/[locale]/conta/actions";

export default function PayOrderButton({
  encomendaId,
  label,
}: {
  encomendaId: string;
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await pagarEncomenda(encomendaId);
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
      return;
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-[#CC1111] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:opacity-60"
    >
      {loading ? "..." : label}
    </button>
  );
}
