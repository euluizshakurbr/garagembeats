"use server";

import { createClient } from "@/lib/supabase/server";

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
