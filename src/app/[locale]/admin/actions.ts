"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function isAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return !!data?.is_admin;
}

interface NovaMusica {
  title: string;
  brand: string;
  estilo: string;
  audioPath: string;
  coverPath: string | null;
  duration: number | null;
}

// Os arquivos (áudio/capa) são enviados direto do navegador para o Supabase
// Storage (ver UploadTrackForm), evitando o limite de tamanho do server action.
// Aqui só gravamos a linha da música no catálogo com os caminhos já enviados.
export async function subirMusica(data: NovaMusica) {
  const supabase = await createClient();

  if (!data.title || !data.brand || !data.audioPath) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const { error: insertError } = await supabase.from("tracks").insert({
    title: data.title,
    brand: data.brand,
    estilo: data.estilo || null,
    audio_path: data.audioPath,
    cover_path: data.coverPath,
    duration_seconds: data.duration,
  });

  if (insertError) {
    console.error("Erro ao salvar música no banco:", insertError);
    return { error: `Falha ao salvar a música no catálogo: ${insertError.message}` };
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin");
  return { ok: true };
}

// Edita os metadados de uma música (título, marca, estilo).
export async function editarMusica(
  trackId: string,
  dados: { title: string; brand: string; estilo: string }
) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user || !(await isAdmin(supabase, userData.user.id))) {
    return { error: "Sem permissão." };
  }
  if (!dados.title.trim() || !dados.brand.trim()) {
    return { error: "Preencha título e marca." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("tracks")
    .update({
      title: dados.title.trim(),
      brand: dados.brand.trim(),
      estilo: dados.estilo || null,
    })
    .eq("id", trackId);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin");
  return { ok: true };
}

// Exclui uma música: remove os arquivos do Storage e a linha do catálogo.
export async function excluirMusica(trackId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user || !(await isAdmin(supabase, userData.user.id))) {
    return { error: "Sem permissão." };
  }

  const admin = createAdminClient();
  const { data: track } = await admin
    .from("tracks")
    .select("audio_path, cover_path")
    .eq("id", trackId)
    .maybeSingle();

  if (!track) {
    return { error: "Música não encontrada." };
  }

  if (track.audio_path) {
    await admin.storage.from("tracks-audio").remove([track.audio_path]);
  }
  if (track.cover_path) {
    await admin.storage.from("tracks-covers").remove([track.cover_path]);
  }

  const { error } = await admin.from("tracks").delete().eq("id", trackId);
  if (error) {
    return { error: "Não foi possível excluir a música." };
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin");
  return { ok: true };
}
