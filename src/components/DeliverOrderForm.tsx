"use client";

import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { marcarEmProducao, entregarEncomenda } from "@/app/[locale]/admin/pedidos/actions";
import { CheckIcon } from "@/components/icons";

export default function DeliverOrderForm({
  encomendaId,
  userId,
  status,
}: {
  encomendaId: string;
  userId: string;
  status: "pendente" | "em_producao" | "entregue";
}) {
  const t = useTranslations("adminPedidos");
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleMarcarEmProducao() {
    setBusy(true);
    const result = await marcarEmProducao(encomendaId);
    if (result.error) setErrorMessage(result.error);
    setBusy(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const result = await entregarEncomenda(formData);

    if (result.error) {
      setErrorMessage(result.error);
      setBusy(false);
      return;
    }

    formRef.current?.reset();
    setBusy(false);
  }

  if (status === "entregue") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-[#CC1111]">
        {t("statusEntregue")} <CheckIcon />
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {status === "pendente" && (
        <button
          onClick={handleMarcarEmProducao}
          disabled={busy}
          className="self-start rounded-lg border border-[#333] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#555] disabled:opacity-60"
        >
          {t("marcarEmProducao")}
        </button>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-wrap items-center gap-2"
      >
        <input type="hidden" name="encomendaId" value={encomendaId} />
        <input type="hidden" name="userId" value={userId} />
        <input
          type="file"
          name="audio"
          accept="audio/*"
          required
          className="text-xs text-[#888]"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[#CC1111] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:opacity-60"
        >
          {busy ? t("enviando") : t("entregar")}
        </button>
      </form>

      {errorMessage && (
        <span className="text-xs text-[#CC1111]">{errorMessage}</span>
      )}
    </div>
  );
}

