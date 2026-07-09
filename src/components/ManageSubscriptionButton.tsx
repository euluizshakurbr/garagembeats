"use client";

import { useState } from "react";
import { abrirPortalAssinatura } from "@/app/[locale]/conta/actions";

export default function ManageSubscriptionButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await abrirPortalAssinatura();
    if (result.url) {
      window.location.href = result.url;
      return;
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="mt-4 inline-flex rounded-xl border border-[#333] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#555] disabled:opacity-60"
    >
      {loading ? "..." : label}
    </button>
  );
}
