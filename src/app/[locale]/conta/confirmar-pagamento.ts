"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { syncSubscriptionFromStripe } from "@/lib/syncAssinatura";

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

// Fallback da assinatura recorrente: recebe o session_id do checkout,
// busca a assinatura no Stripe e sincroniza nossa tabela.
export async function confirmarAssinatura(sessionId: string) {
  if (!isStripeConfigured()) return;

  const supabase = createAdminClient();
  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.mode !== "subscription" || !session.subscription) return;
    if (session.payment_status === "unpaid") return;

    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subId);

    await syncSubscriptionFromStripe(supabase, subscription);
    revalidatePath("/conta");
  } catch (err) {
    console.error("Erro ao confirmar a assinatura:", err);
  }
}
