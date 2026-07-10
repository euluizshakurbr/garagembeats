import SiteHeader from "@/components/SiteHeader";
import AdminNav from "@/components/AdminNav";
import DepoimentosAdmin from "@/components/DepoimentosAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Depoimento } from "@/lib/types";

export default async function DepoimentosAdminPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("depoimentos")
    .select("*")
    .order("created_at", { ascending: false });
  const depoimentos = (data ?? []) as Depoimento[];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <AdminNav />
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Depoimentos
          </h1>
          <p className="mt-2 text-[#888]">
            Cadastre avaliações de clientes para aparecer na home e nos planos.
          </p>
          <DepoimentosAdmin depoimentos={depoimentos} />
        </div>
      </main>
    </div>
  );
}
