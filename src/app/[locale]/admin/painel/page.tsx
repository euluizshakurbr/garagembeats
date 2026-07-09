import { getLocale } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import AdminNav from "@/components/AdminNav";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, getPlan } from "@/lib/plans";
import { redirect } from "@/i18n/navigation";

function formatBRL(cents: number) {
  return `R$${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default async function PainelAdminPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect({ href: "/login", locale });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user!.id)
    .single();
  if (!profile?.is_admin) redirect({ href: "/conta", locale });

  // Leitura agregada precisa do client admin (a RLS limita cada usuário aos
  // próprios dados). A página já é protegida por admin acima e no proxy.
  const admin = createAdminClient();

  const [{ data: subs }, { count: totalContas }, { data: encomendas }] =
    await Promise.all([
      admin.from("subscriptions").select("plan").eq("status", "active"),
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("encomendas").select("status, pagamento_confirmado, created_at"),
    ]);

  const assinaturas = subs ?? [];
  const porPlano: Record<string, number> = {};
  let mrrCents = 0;
  for (const s of assinaturas) {
    porPlano[s.plan] = (porPlano[s.plan] ?? 0) + 1;
    const plan = getPlan(s.plan);
    if (plan) mrrCents += plan.priceCents;
  }

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const pedidos = encomendas ?? [];
  const pedidosAcao = pedidos.filter(
    (e) => e.pagamento_confirmado && e.status !== "entregue"
  ).length;
  const pedidosMes = pedidos.filter(
    (e) => new Date(e.created_at) >= inicioMes
  ).length;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <AdminNav />
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Painel</h1>
          <p className="mt-2 text-[#888]">Visão geral do negócio.</p>

          {/* Destaques */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <StatCard
              destaque
              label="Receita mensal (MRR)"
              value={formatBRL(mrrCents)}
              hint="Soma das assinaturas ativas por mês"
            />
            <StatCard
              destaque
              label="Assinantes ativos"
              value={String(assinaturas.length)}
              hint="Contas com plano ativo agora"
            />
          </div>

          {/* Assinantes por plano */}
          <h2 className="mt-10 text-lg font-semibold text-white">
            Assinantes por plano
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <StatCard
                key={plan.id}
                label={plan.name}
                value={String(porPlano[plan.id] ?? 0)}
                hint={`${plan.priceLabel}/mês`}
              />
            ))}
          </div>

          {/* Pedidos e contas */}
          <h2 className="mt-10 text-lg font-semibold text-white">
            Pedidos e contas
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Precisam de ação"
              value={String(pedidosAcao)}
              hint="Pagos e ainda não entregues"
              alerta={pedidosAcao > 0}
            />
            <StatCard
              label="Pedidos no mês"
              value={String(pedidosMes)}
              hint="Encomendas criadas este mês"
            />
            <StatCard
              label="Contas criadas"
              value={String(totalContas ?? 0)}
              hint="Total de cadastros"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  destaque = false,
  alerta = false,
}: {
  label: string;
  value: string;
  hint?: string;
  destaque?: boolean;
  alerta?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        destaque
          ? "border-[#CC1111]/40 bg-gradient-to-b from-[#1a0808] to-[#111]"
          : alerta
            ? "border-[#CC1111]/40 bg-[#111]"
            : "border-[#1a1a1a] bg-[#111]"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[#888]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#555]">{hint}</p>}
    </div>
  );
}
