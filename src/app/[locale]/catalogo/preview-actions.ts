"use server";

import { createAdminClient } from "@/lib/supabase/admin";

// Streaming público (sem exigir login/assinatura) — usa o client admin pra
// gerar um link temporário, sem o parâmetro "download", então o áudio toca
// inline em vez de baixar. A faixa inteira pode ser ouvida; só o download
// do arquivo exige plano ou compra avulsa.
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
