import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlan } from "@/lib/plans";

// Sincroniza a linha em `subscriptions` a partir de uma assinatura do Stripe.
// É idempotente: pode ser chamada por qualquer evento (checkout, renovação,
// cancelamento) que o resultado converge pro estado atual no Stripe.
export async function syncSubscriptionFromStripe(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;
  if (!userId) return;

  // Em versões novas da API o período fica no item; nas antigas, no topo.
  const item = subscription.items?.data?.[0];
  const periodStart =
    (item as { current_period_start?: number } | undefined)
      ?.current_period_start ??
    (subscription as unknown as { current_period_start?: number })
      .current_period_start;
  const periodEnd =
    (item as { current_period_end?: number } | undefined)
      ?.current_period_end ??
    (subscription as unknown as { current_period_end?: number })
      .current_period_end;

  const plan = planId ? getPlan(planId) : null;

  const row: Record<string, unknown> = {
    user_id: userId,
    status: subscription.status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
  };

  if (plan) row.plan = plan.id;
  if (periodStart) {
    row.current_period_start = new Date(periodStart * 1000).toISOString();
  }
  if (periodEnd) {
    row.current_period_end = new Date(periodEnd * 1000).toISOString();
  }

  await supabase.from("subscriptions").upsert(row, { onConflict: "user_id" });
}
