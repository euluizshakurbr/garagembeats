import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import DeliverOrderForm from "@/components/DeliverOrderForm";
import { createClient } from "@/lib/supabase/server";
import type { Encomenda } from "@/lib/types";

export default async function PedidosAdminPage() {
  const t = await getTranslations("adminPedidos");
  const STATUS_LABEL: Record<Encomenda["status"], string> = {
    pendente: t("statusPendente"),
    em_producao: t("statusEmProducao"),
    entregue: t("statusEntregue"),
  };

  const supabase = await createClient();
  const { data } = await supabase
    .from("encomendas")
    .select("*")
    .order("created_at", { ascending: false });

  const encomendas = (data ?? []) as Encomenda[];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {t("titulo")}
          </h1>
          <p className="mt-2 text-[#888]">{t("descricao")}</p>

          {encomendas.length === 0 ? (
            <p className="mt-10 text-[#555]">{t("nenhumPedido")}</p>
          ) : (
            <div className="mt-8 flex flex-col gap-4">
              {encomendas.map((encomenda) => (
                <div
                  key={encomenda.id}
                  className="rounded-2xl border border-[#1a1a1a] bg-[#111] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-[#CC1111]">
                        {encomenda.codigo_pedido}
                      </p>
                      <p className="mt-1 font-semibold text-white">
                        {encomenda.nome} · {encomenda.carro}
                      </p>
                      <p className="mt-1 text-xs text-[#888]">
                        WhatsApp: {encomenda.whatsapp}
                        {encomenda.email ? ` · ${encomenda.email}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-[#888]">
                        Estilo: {encomenda.estilo} · Idioma: {encomenda.idioma}
                      </p>
                      <p className="mt-2 max-w-xl text-sm text-[#888]">
                        {encomenda.historia}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-0.5 text-[11px] text-[#888]">
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
                          ? t("pago")
                          : t("aguardandoPagamento")}
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
      </main>
    </div>
  );
}
