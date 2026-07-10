"use client";

import { useEffect } from "react";
import { trackMeta } from "@/lib/meta";

// Dispara um evento padrão da Meta uma vez, ao montar (ex.: ViewContent numa página).
export default function MetaEvent({
  event,
  params,
}: {
  event: string;
  params?: Record<string, unknown>;
}) {
  useEffect(() => {
    trackMeta(event, params);
    // dispara só na montagem (uma visualização = um evento)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
