import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { ativarAssinatura } from "@/lib/ativarAssinatura";

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

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Assinatura inválida no webhook do Stripe:", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as {
    id: string;
    payment_intent: string | null;
    metadata: Record<string, string> | null;
  };

  const metadata = session.metadata;
  if (!metadata) {
    return NextResponse.json({ ok: true });
  }

  try {
    const supabase = createAdminClient();
    const paymentId = session.payment_intent ?? session.id;

    if (metadata.tipo === "assinatura") {
      await ativarAssinatura(supabase, metadata.userId, metadata.planId, paymentId);
    } else if (metadata.tipo === "encomenda") {
      await supabase
        .from("encomendas")
        .update({ pagamento_confirmado: true, stripe_payment_id: paymentId })
        .eq("id", metadata.encomendaId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no webhook do Stripe:", err);
    return NextResponse.json({ ok: true });
  }
}
