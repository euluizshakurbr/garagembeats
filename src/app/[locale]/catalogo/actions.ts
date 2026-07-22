"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getStripeClient,
  isStripeConfigured,
  getPaymentMethodTypes,
} from "@/lib/stripe";
import { getPlan, getAvulsaPreco } from "@/lib/plans";
import { localizedPath } from "@/i18n/paths";
import type { Subscription } from "@/lib/types";

function nomeArquivo(title: string, audioPath: string) {
  const ext = audioPath.split(".").pop();
  return `${title}.${ext}`;
}

export async function baixarTrack(
  trackId: string,
  audioPath: string,
  title: string
) {
  const t = await getTranslations("errors");
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: t("loginParaBaixar") };
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .single();
  const isAdmin = !!profileData?.is_admin;

  if (!isAdmin) {
    // Compra avulsa dessa música específica: libera direto, sem contar no
    // limite do plano nem gastar o download grátis.
    const { count: avulsaCount } = await supabase
      .from("compras_avulsas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userData.user.id)
      .eq("track_id", trackId)
      .eq("pagamento_confirmado", true);

    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .maybeSingle();

    const subscription = subscriptionData as Subscription | null;
    // Rede de segurança: além do status 'active', exige que o período ainda
    // esteja válido (caso um webhook de expiração tenha se perdido).
    const periodValido =
      !subscription?.current_period_end ||
      new Date(subscription.current_period_end).getTime() > Date.now();

    if (avulsaCount && avulsaCount > 0) {
      // já pago avulso — pula direto pra geração do link abaixo.
    } else if (subscription && periodValido) {
      // Plano ativo: aplica o limite mensal do plano.
      const plan = getPlan(subscription.plan);
      if (plan && plan.downloadLimit !== null) {
        const { count } = await supabase
          .from("downloads")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userData.user.id)
          .gte("created_at", subscription.current_period_start);

        if ((count ?? 0) >= plan.downloadLimit) {
          return { error: t("limiteDownloads", { limite: plan.downloadLimit }) };
        }
      }
    } else {
      // Sem plano ativo: cada conta tem direito a 1 download grátis vitalício.
      const { count } = await supabase
        .from("downloads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userData.user.id);

      if ((count ?? 0) >= 1) {
        return { error: t("limiteGratis"), needsPlan: true };
      }
    }
  }

  // A autorização já foi feita acima (plano/limite/grátis). O link é gerado
  // com o client admin porque a RLS do bucket exige assinatura ativa — o que
  // bloquearia o download grátis. A checagem de permissão é a lógica acima.
  const admin = createAdminClient();
  const { data: signedUrlData, error: signedUrlError } = await admin.storage
    .from("tracks-audio")
    .createSignedUrl(audioPath, 60, { download: nomeArquivo(title, audioPath) });

  if (signedUrlError || !signedUrlData) {
    return { error: t("erroGerarLink") };
  }

  await supabase.from("downloads").insert({
    user_id: userData.user.id,
    track_id: trackId,
  });

  return { url: signedUrlData.signedUrl };
}

// Checkout de pagamento único para comprar 1 música avulsa, sem assinatura —
// usado quando a pessoa bateu no limite do plano/download grátis mas só
// quer aquela faixa específica.
export async function comprarAvulsa(trackId: string, title: string) {
  const t = await getTranslations("errors");
  if (!isStripeConfigured()) {
    return { error: t("pagamentoNaoConfigurado") };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: t("loginParaBaixar") };
  }

  const { data: compra, error: insertError } = await supabase
    .from("compras_avulsas")
    .insert({ user_id: userData.user.id, track_id: trackId })
    .select()
    .single();

  if (insertError || !compra) {
    console.error("Erro ao criar compra avulsa:", insertError);
    return { error: t("erroIniciarPagamento") };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locale = await getLocale();
  const preco = getAvulsaPreco(locale);

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      locale: locale === "en" ? "en" : "pt-BR",
      mode: "payment",
      payment_method_types: getPaymentMethodTypes(preco.currency),
      customer_email: userData.user.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: preco.currency,
            unit_amount: preco.cents,
            product_data: {
              name:
                locale === "en"
                  ? `Song: ${title} — Garagem Beats`
                  : `Música: ${title} — Garagem Beats`,
            },
          },
        },
      ],
      metadata: { tipo: "avulsa", compraId: compra.id },
      success_url: `${appUrl}${localizedPath("/catalogo", locale)}?musica=${trackId}&comprada=1`,
      cancel_url: `${appUrl}${localizedPath("/catalogo", locale)}?musica=${trackId}`,
    });

    await supabase
      .from("compras_avulsas")
      .update({ stripe_session_id: session.id })
      .eq("id", compra.id);

    return { checkoutUrl: session.url };
  } catch (err) {
    console.error("Erro ao criar sessão de checkout da compra avulsa:", err);
    return { error: t("erroIniciarPagamento") };
  }
}
