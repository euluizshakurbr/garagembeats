"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan, getPlanPreco } from "@/lib/plans";
import {
  getStripeClient,
  isStripeConfigured,
  getPaymentMethodTypes,
} from "@/lib/stripe";
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locale = await getLocale();
  const preco = getPlanPreco(plan, locale);

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      locale: locale === "en" ? "en" : "pt-BR",
      mode: "payment",
      payment_method_types: getPaymentMethodTypes(preco.currency),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: preco.currency,
            unit_amount: preco.cents,
            product_data: {
              name:
                locale === "en"
                  ? `Garagem Beats Subscription — ${plan.nameEn}`
                  : `Assinatura Garagem Beats — ${plan.name}`,
            },
          },
        },
      ],
      metadata: {
        tipo: "assinatura",
        userId: userData.user.id,
        planId: plan.id,
      },
      success_url: `${appUrl}${localizedPath("/conta", locale)}?plano=${plan.id}`,
      cancel_url: `${appUrl}${localizedPath("/planos", locale)}?erro=pagamento`,
    });

    // A assinatura é ativada pelo webhook do Stripe após o pagamento
    // ser confirmado (ver src/lib/ativarAssinatura.ts). Não gravamos uma
    // linha "pending" aqui porque o schema só aceita 'active'/'canceled'.
    return { checkoutUrl: session.url };
  } catch (err) {
    console.error("Erro ao criar sessão de checkout da assinatura:", err);
    return { error: t("erroIniciarPagamento") };
  }
}
