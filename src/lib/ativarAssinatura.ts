import type { SupabaseClient } from "@supabase/supabase-js";
import { getPlan } from "@/lib/plans";

export async function ativarAssinatura(
  supabase: SupabaseClient,
  userId: string,
  planId: string,
  stripePaymentId: string
) {
  const plan = getPlan(planId);
  if (!plan) return;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await supabase.from("subscriptions").upsert({
    user_id: userId,
    plan: plan.id,
    status: "active",
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    stripe_payment_id: stripePaymentId,
  });
}
