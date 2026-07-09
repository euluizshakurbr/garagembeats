"use server";

import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan } from "@/lib/plans";
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
    if (!subscription || !periodValido) {
      return { error: t("assineParaBaixar"), needsPlan: true };
    }

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
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
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
