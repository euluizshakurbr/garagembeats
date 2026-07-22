import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { syncSubscriptionFromStripe } from "@/lib/syncAssinatura";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await request.text();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ ok: true });
  }

  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Assinatura inválida no webhook do Stripe:", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    switch (event.type) {
      // Criação, renovação mensal, troca de plano, cancelamento agendado.
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscriptionFromStripe(
          supabase,
          event.data.object as Stripe.Subscription
        );
        break;
      }

      // Ativação imediata na volta do checkout (assinatura ou encomenda).
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subId);
          await syncSubscriptionFromStripe(supabase, subscription);
        } else if (session.metadata?.tipo === "encomenda") {
          const paymentId = String(session.payment_intent ?? session.id);
          await supabase
            .from("encomendas")
            .update({ pagamento_confirmado: true, stripe_payment_id: paymentId })
            .eq("id", session.metadata.encomendaId);
        } else if (session.metadata?.tipo === "avulsa") {
          const paymentId = String(session.payment_intent ?? session.id);
          await supabase
            .from("compras_avulsas")
            .update({ pagamento_confirmado: true, stripe_payment_id: paymentId })
            .eq("id", session.metadata.compraId);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no webhook do Stripe:", err);
    // 500 faz o Stripe reenviar o evento depois (retry automático por dias).
    // Devolver 200 aqui descartaria o evento — assinatura/encomenda paga
    // poderia ficar sem ativar se o banco falhar neste instante.
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
