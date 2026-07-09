import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import OrdersAdmin from "@/components/OrdersAdmin";
import { createClient } from "@/lib/supabase/server";
import type { Encomenda } from "@/lib/types";

export default async function PedidosAdminPage() {
  const t = await getTranslations("adminPedidos");

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
            <OrdersAdmin encomendas={encomendas} />
          )}
        </div>
      </main>
    </div>
  );
}
