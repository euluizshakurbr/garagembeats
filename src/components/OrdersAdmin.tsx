"use client";

import { useMemo, useState } from "react";
import DeliverOrderForm from "@/components/DeliverOrderForm";
import type { Encomenda } from "@/lib/types";

type Filtro = "acao" | "pendente" | "em_producao" | "entregue" | "todos";

const STATUS_LABEL: Record<Encomenda["status"], string> = {
  pendente: "Pendente",
  em_producao: "Em produção",
  entregue: "Entregue",
};

const STATUS_STYLE: Record<Encomenda["status"], string> = {
  pendente: "bg-amber-500/15 text-amber-400",
  em_producao: "bg-blue-500/15 text-blue-400",
  entregue: "bg-green-500/15 text-green-400",
};

function precisaAcao(e: Encomenda) {
  return e.pagamento_confirmado && e.status !== "entregue";
}

function whatsappLink(numero: string) {
  const digits = numero.replace(/\D/g, "");
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${full}`;
}

export default function OrdersAdmin({
  encomendas,
}: {
  encomendas: Encomenda[];
}) {
  const [filtro, setFiltro] = useState<Filtro>("acao");
  const [busca, setBusca] = useState("");

  const contagens = useMemo(
    () => ({
      acao: encomendas.filter(precisaAcao).length,
      pendente: encomendas.filter((e) => e.status === "pendente").length,
      em_producao: encomendas.filter((e) => e.status === "em_producao").length,
      entregue: encomendas.filter((e) => e.status === "entregue").length,
      todos: encomendas.length,
    }),
    [encomendas]
  );

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return encomendas.filter((e) => {
      const matchFiltro =
        filtro === "todos"
          ? true
          : filtro === "acao"
            ? precisaAcao(e)
            : e.status === filtro;
      const matchBusca =
        q === "" ||
        e.codigo_pedido.toLowerCase().includes(q) ||
        e.nome.toLowerCase().includes(q) ||
        e.carro.toLowerCase().includes(q);
      return matchFiltro && matchBusca;
    });
  }, [encomendas, filtro, busca]);

  const tabs: { key: Filtro; label: string }[] = [
    { key: "acao", label: "Precisam de ação" },
    { key: "pendente", label: "Pendentes" },
    { key: "em_producao", label: "Em produção" },
    { key: "entregue", label: "Entregues" },
    { key: "todos", label: "Todos" },
  ];

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFiltro(tab.key)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              filtro === tab.key
                ? "bg-[#CC1111] text-white"
                : "border border-[#333] text-[#888] hover:text-white"
            }`}
          >
            {tab.label} ({contagens[tab.key]})
          </button>
        ))}
      </div>

      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por código, nome ou carro..."
        className="mt-4 w-full max-w-sm rounded-xl border border-[#1a1a1a] bg-[#111] px-4 py-2.5 text-sm text-white outline-none placeholder-[#555] focus:border-[#CC1111]"
      />

      {filtradas.length === 0 ? (
        <p className="mt-8 text-sm text-[#555]">Nenhum pedido neste filtro.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {filtradas.map((encomenda) => (
            <div
              key={encomenda.id}
              className={`rounded-2xl border bg-[#111] p-5 ${
                precisaAcao(encomenda)
                  ? "border-[#CC1111]/50"
                  : "border-[#1a1a1a]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-[#CC1111]">
                    {encomenda.codigo_pedido}
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {encomenda.nome} · {encomenda.carro}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={whatsappLink(encomenda.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:border-[#555]"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.9.9-2.8-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3c-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1 0-.1-.2-.2-.4-.3Z" />
                      </svg>
                      WhatsApp
                    </a>
                    {encomenda.email && (
                      <a
                        href={`mailto:${encomenda.email}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:border-[#555]"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="m3 7 9 6 9-6" />
                        </svg>
                        E-mail
                      </a>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-[#888]">
                    Estilo: {encomenda.estilo} · Idioma: {encomenda.idioma}
                  </p>
                  <p className="mt-2 max-w-xl text-sm text-[#888]">
                    {encomenda.historia}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[encomenda.status]}`}
                  >
                    {STATUS_LABEL[encomenda.status]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      encomenda.pagamento_confirmado
                        ? "bg-[#CC1111]/15 text-[#CC1111]"
                        : "border border-[#2a2a2a] text-[#555]"
                    }`}
                  >
                    {encomenda.pagamento_confirmado
                      ? "Pago"
                      : "Aguardando pagamento"}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-[#1a1a1a] pt-4">
                <DeliverOrderForm
                  encomendaId={encomenda.id}
                  userId={encomenda.user_id}
                  status={encomenda.status}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
