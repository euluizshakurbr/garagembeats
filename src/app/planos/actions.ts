"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan, getPlanPreco } from "@/lib/plans";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

export async function assinarPlano(planId: string) {
  const t = await getTranslations("errors");
  const plan = getPlan(planId);
  if (!plan) {
    return { error: t("planoInvalido") };
  }

  if (!isStripeConfigured()) {
    return { error: t("pagamentoNaoConfigurado") };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: t("loginParaAssinar") };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locale = await getLocale();
  const preco = getPlanPreco(plan, locale);

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: preco.currency === "brl" ? ["card", "pix"] : ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: preco.currency,
            unit_amount: preco.cents,
            product_data: {
              name: `Assinatura Garagem Beats — ${plan.name}`,
            },
          },
        },
      ],
      metadata: {
        tipo: "assinatura",
        userId: userData.user.id,
        planId: plan.id,
      },
      success_url: `${appUrl}/conta?plano=${plan.id}`,
      cancel_url: `${appUrl}/planos?erro=pagamento`,
    });

    // Marca a assinatura como "pending" até o pagamento ser confirmado
    // (via webhook ou na volta do checkout).
    const { error: upsertError } = await supabase.from("subscriptions").upsert({
      user_id: userData.user.id,
      plan: plan.id,
      status: "pending",
      stripe_session_id: session.id,
    });

    if (upsertError) {
      return { error: t("erroIniciarAssinatura") };
    }

    return { checkoutUrl: session.url };
  } catch (err) {
    console.error("Erro ao criar sessão de checkout da assinatura:", err);
    return { error: t("erroIniciarPagamento") };
  }
}
