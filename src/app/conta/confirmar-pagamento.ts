"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { ativarAssinatura } from "@/lib/ativarAssinatura";

// Fallback pro caso do webhook não alcançar o servidor (ex: ambiente local)
// — confere o pagamento direto na API da Stripe quando o cliente volta do
// checkout. Usa o client admin porque essa verificação não depende de
// sessão de usuário (a autorização real é a resposta da API da Stripe).
export async function confirmarPagamentoEncomenda(encomendaId: string) {
  if (!isStripeConfigured()) return;

  const supabase = createAdminClient();
  const { data: encomenda } = await supabase
    .from("encomendas")
    .select("pagamento_confirmado, stripe_session_id")
    .eq("id", encomendaId)
    .maybeSingle();

  if (!encomenda || encomenda.pagamento_confirmado || !encomenda.stripe_session_id) {
    return;
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(
      encomenda.stripe_session_id
    );

    if (session.payment_status !== "paid") return;

    await supabase
      .from("encomendas")
      .update({
        pagamento_confirmado: true,
        stripe_payment_id: String(session.payment_intent ?? session.id),
      })
      .eq("id", encomendaId);

    revalidatePath("/conta");
  } catch (err) {
    console.error("Erro ao confirmar pagamento da encomenda:", err);
  }
}

export async function confirmarAssinatura(userId: string, planId: string) {
  if (!isStripeConfigured()) return;

  const supabase = createAdminClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, stripe_session_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (subscription?.status === "active" || !subscription?.stripe_session_id) {
    return;
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(
      subscription.stripe_session_id
    );

    if (session.payment_status !== "paid") return;

    await ativarAssinatura(
      supabase,
      userId,
      planId,
      String(session.payment_intent ?? session.id)
    );
    revalidatePath("/conta");
  } catch (err) {
    console.error("Erro ao confirmar pagamento da assinatura:", err);
  }
}
