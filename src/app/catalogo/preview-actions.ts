"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// Preview público (sem exigir login/assinatura) — usa o client admin pra
// gerar um link de streaming temporário, sem o parâmetro "download", então
// o áudio toca inline em vez de baixar. O front limita a 60s de reprodução.
export async function gerarPreviewUrl(audioPath: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("tracks-audio")
    .createSignedUrl(audioPath, 120);

  if (error || !data) {
    return { error: "Não foi possível carregar o preview." };
  }

  return { url: data.signedUrl };
}
