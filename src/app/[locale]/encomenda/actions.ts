"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  getStripeClient,
  isStripeConfigured,
  getPaymentMethodTypes,
} from "@/lib/stripe";
import { getPlan, getEncomendaPreco } from "@/lib/plans";
import { localizedPath } from "@/i18n/paths";
import type { Subscription } from "@/lib/types";

interface NovaEncomenda {
  nome: string;
  whatsapp: string;
  email?: string;
  carro: string;
  historia: string;
  estilo: string;
  idioma: string;
}

export async function criarEncomenda(dados: NovaEncomenda) {
  const t = await getTranslations("errors");
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: t("loginParaEncomenda") };
  }

  if (
    !dados.nome ||
    !dados.whatsapp ||
    !dados.carro ||
    !dados.historia ||
    !dados.estilo ||
    !dados.idioma
  ) {
    return { error: t("preencherCampos") };
  }

  // Verifica se o plano do usuário inclui encomendas grátis esse mês
  let encomendaIncluida = false;
  const { data: subscriptionData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userData.user.id)
    .eq("status", "active")
    .maybeSingle();
  const subscription = subscriptionData as Subscription | null;

  if (subscription) {
    const plan = getPlan(subscription.plan);
    if (plan && plan.encomendasIncluidas > 0) {
      const { count } = await supabase
        .from("encomendas")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userData.user.id)
        .gte("created_at", subscription.current_period_start);

      if ((count ?? 0) < plan.encomendasIncluidas) {
        encomendaIncluida = true;
      }
    }
  }

  const codigoPedido = `GB-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const { data: encomenda, error: insertError } = await supabase
    .from("encomendas")
    .insert({
      user_id: userData.user.id,
      codigo_pedido: codigoPedido,
      nome: dados.nome,
      whatsapp: dados.whatsapp,
      email: dados.email || null,
      carro: dados.carro,
      historia: dados.historia,
      estilo: dados.estilo,
      idioma: dados.idioma,
      pagamento_confirmado: encomendaIncluida,
    })
    .select()
    .single();

  if (insertError || !encomenda) {
    console.error("Erro ao criar encomenda:", insertError);
    return { error: t("erroEnviarPedido") };
  }

  if (encomendaIncluida) {
    return { ok: true, incluida: true };
  }

  if (!isStripeConfigured()) {
    return { error: t("pagamentoNaoConfigurado") };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locale = await getLocale();
  const preco = getEncomendaPreco(locale);

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      locale: locale === "en" ? "en" : "pt-BR",
      mode: "payment",
      payment_method_types: getPaymentMethodTypes(preco.currency),
      customer_email: dados.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: preco.currency,
            unit_amount: preco.cents,
            product_data: {
              name:
                locale === "en"
                  ? "Custom song — Garagem Beats"
                  : "Música personalizada — Garagem Beats",
            },
          },
        },
      ],
      metadata: {
        tipo: "encomenda",
        encomendaId: encomenda.id,
      },
      success_url: `${appUrl}${localizedPath("/conta", locale)}?pedido=${encomenda.id}`,
      cancel_url: `${appUrl}${localizedPath("/encomenda", locale)}?erro=pagamento`,
    });

    await supabase
      .from("encomendas")
      .update({ stripe_session_id: session.id })
      .eq("id", encomenda.id);

    return { checkoutUrl: session.url };
  } catch (err) {
    console.error("Erro ao criar sessão de checkout da encomenda:", err);
    return { error: t("erroIniciarPagamento") };
  }
}
