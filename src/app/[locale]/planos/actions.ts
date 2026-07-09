"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan, getPlanPreco } from "@/lib/plans";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { localizedPath } from "@/i18n/paths";

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

  // Evita criar uma segunda assinatura (cobrança dupla) — quem já tem uma
  // assinatura ativa deve gerenciar/trocar pelo portal do Stripe na conta.
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("status, stripe_subscription_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (existing?.status === "active" && existing?.stripe_subscription_id) {
    return { error: t("jaTemPlanoAtivo") };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locale = await getLocale();
  const preco = getPlanPreco(plan, locale);

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      locale: locale === "en" ? "en" : "pt-BR",
      // Assinatura recorrente mensal. PIX não suporta recorrência no Stripe,
      // então planos são sempre no cartão (PIX segue valendo pra encomendas).
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: userData.user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: preco.currency,
            unit_amount: preco.cents,
            recurring: { interval: "month" },
            product_data: {
              name:
                locale === "en"
                  ? `Garagem Beats Subscription — ${plan.nameEn}`
                  : `Assinatura Garagem Beats — ${plan.name}`,
            },
          },
        },
      ],
      // metadata na assinatura para o webhook identificar o usuário/plano
      // em todo evento (criação, renovação, cancelamento).
      subscription_data: {
        metadata: { userId: userData.user.id, planId: plan.id },
      },
      metadata: {
        tipo: "assinatura",
        userId: userData.user.id,
        planId: plan.id,
      },
      success_url: `${appUrl}${localizedPath("/conta", locale)}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${localizedPath("/planos", locale)}?erro=pagamento`,
    });

    // A assinatura é criada/ativada pelo webhook do Stripe (e, como fallback,
    // na volta do checkout via confirmarAssinatura com o session_id).
    return { checkoutUrl: session.url };
  } catch (err) {
    console.error("Erro ao criar sessão de checkout da assinatura:", err);
    return { error: t("erroIniciarPagamento") };
  }
}
