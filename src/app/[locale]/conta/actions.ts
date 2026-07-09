"use server";

import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { localizedPath } from "@/i18n/paths";
import type { Subscription } from "@/lib/types";

export async function gerarLinkDownload(audioPath: string, title: string) {
  const supabase = await createClient();
  const ext = audioPath.split(".").pop();
  const { data, error } = await supabase.storage
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
