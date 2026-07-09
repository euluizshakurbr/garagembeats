"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getStripeClient,
  isStripeConfigured,
  getPaymentMethodTypes,
} from "@/lib/stripe";
import { getEncomendaPreco } from "@/lib/plans";
import { localizedPath } from "@/i18n/paths";
import type { Subscription } from "@/lib/types";

// Atualiza nome/WhatsApp do perfil e, opcionalmente, a senha.
export async function atualizarConta(dados: {
  nome: string;
  whatsapp: string;
  novaSenha?: string;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Faça login para atualizar seus dados." };
  }

  if (!dados.nome.trim() || !dados.whatsapp.trim()) {
    return { error: "Preencha nome e WhatsApp." };
  }

  if (dados.novaSenha) {
    if (dados.novaSenha.length < 6) {
      return { error: "A nova senha precisa ter pelo menos 6 caracteres." };
    }
    const { error: senhaError } = await supabase.auth.updateUser({
      password: dados.novaSenha,
    });
    if (senhaError) {
      return { error: "Não foi possível trocar a senha. Tente novamente." };
    }
  }

  // Perfil: usa o client admin (a tabela profiles não tem policy de UPDATE
  // pro usuário). A autorização é a checagem de sessão acima.
  const admin = createAdminClient();
  const { error: perfilError } = await admin
    .from("profiles")
    .update({ nome: dados.nome.trim(), whatsapp: dados.whatsapp.trim() })
    .eq("id", userData.user.id);

  if (perfilError) {
    return { error: "Não foi possível salvar seus dados. Tente novamente." };
  }

  revalidatePath("/conta");
  return { ok: true };
}

// Recria o checkout de uma encomenda ainda não paga (recupera pedido abandonado).
export async function pagarEncomenda(encomendaId: string) {
  if (!isStripeConfigured()) {
    return { error: "Pagamento não configurado." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Faça login para pagar." };
  }

  const { data: encomenda } = await supabase
    .from("encomendas")
    .select("*")
    .eq("id", encomendaId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!encomenda || encomenda.pagamento_confirmado) {
    return { error: "Pedido não encontrado ou já pago." };
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
      customer_email: encomenda.email || undefined,
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
      metadata: { tipo: "encomenda", encomendaId: encomenda.id },
      success_url: `${appUrl}${localizedPath("/conta", locale)}?pedido=${encomenda.id}`,
      cancel_url: `${appUrl}${localizedPath("/conta", locale)}`,
    });

    await supabase
      .from("encomendas")
      .update({ stripe_session_id: session.id })
      .eq("id", encomenda.id);

    return { checkoutUrl: session.url };
  } catch (err) {
    console.error("Erro ao recriar checkout da encomenda:", err);
    return { error: "Não foi possível iniciar o pagamento. Tente novamente." };
  }
}

export async function gerarLinkDownload(audioPath: string, title: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Não foi possível gerar o link de download." };
  }

  // Confirma que esse áudio está no histórico de downloads do usuário
  // (evita gerar link de faixa que a pessoa nunca baixou).
  const { data: track } = await supabase
    .from("tracks")
    .select("id")
    .eq("audio_path", audioPath)
    .maybeSingle();
  if (track) {
    const { count } = await supabase
      .from("downloads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userData.user.id)
      .eq("track_id", track.id);
    if (!count) {
      return { error: "Não foi possível gerar o link de download." };
    }
  }

  // Client admin porque a RLS do bucket exige assinatura ativa (a autorização
  // é a checagem de histórico acima).
  const ext = audioPath.split(".").pop();
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("tracks-audio")
    .createSignedUrl(audioPath, 60, { download: `${title}.${ext}` });

  if (error || !data) {
    return { error: "Não foi possível gerar o link de download." };
  }

  return { url: data.signedUrl };
}

// Abre o Customer Portal do Stripe: o cliente cancela, atualiza cartão,
// vê faturas — tudo hospedado pelo Stripe.
export async function abrirPortalAssinatura() {
  if (!isStripeConfigured()) {
    return { error: "Pagamento não configurado." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Faça login para gerenciar a assinatura." };
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  const subscription = data as Subscription | null;

  if (!subscription?.stripe_customer_id) {
    return { error: "Nenhuma assinatura encontrada." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const locale = await getLocale();

  try {
    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}${localizedPath("/conta", locale)}`,
    });
    return { url: session.url };
  } catch (err) {
    console.error("Erro ao abrir o portal de assinatura:", err);
    return { error: "Não foi possível abrir o portal agora. Tente novamente." };
  }
}

export async function gerarLinkEncomenda(audioPath: string, title: string) {
  const supabase = await createClient();
  const ext = audioPath.split(".").pop();
  const { data, error } = await supabase.storage
    .from("encomendas-audio")
    .createSignedUrl(audioPath, 60, { download: `${title}.${ext}` });

  if (error || !data) {
    return { error: "Não foi possível gerar o link de download." };
  }

  return { url: data.signedUrl };
}
