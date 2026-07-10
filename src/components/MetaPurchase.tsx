"use client";

import { useEffect } from "react";
import { trackMeta } from "@/lib/meta";

// Dispara o evento Purchase da Meta ao carregar a tela de sucesso do checkout.
// O eventID evita contagem duplicada se o usuário atualizar a página.
export default function MetaPurchase({
  value,
  currency,
  eventId,
}: {
  value: number;
  currency: string;
  eventId: string;
}) {
  useEffect(() => {
    trackMeta(
      "Purchase",
      { value, currency: currency.toUpperCase() },
      { eventID: eventId }
    );
  }, [value, currency, eventId]);

  return null;
}
