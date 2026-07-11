"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

// Gera um slug único a partir do título (acrescenta -2, -3... se já existir).
async function slugUnico(
  admin: ReturnType<typeof createAdminClient>,
  title: string
) {
  const base = slugify(title) || "musica";
  const { data } = await admin
    .from("tracks")
    .select("slug")
    .ilike("slug", `${base}%`);
  const usados = new Set((data ?? []).map((t) => t.slug));
  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

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

  const admin = createAdminClient();
  const slug = await slugUnico(admin, data.title);

  const { error: insertError } = await supabase.from("tracks").insert({
    title: data.title,
    brand: data.brand,
    estilo: data.estilo || null,
    audio_path: data.audioPath,
    cover_path: data.coverPath,
    duration_seconds: data.duration,
    slug,
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
  dados: {
    title: string;
    brand: string;
    estilo: string;
    coverPath?: string | null;
  }
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

  const updateData: Record<string, unknown> = {
    title: dados.title.trim(),
    brand: dados.brand.trim(),
    estilo: dados.estilo || null,
  };

  // Se veio uma capa nova, guarda a antiga pra apagar depois da atualização.
  let capaAntiga: string | null = null;
  if (dados.coverPath) {
    const { data: atual } = await admin
      .from("tracks")
      .select("cover_path")
      .eq("id", trackId)
      .maybeSingle();
    capaAntiga = (atual?.cover_path as string | null) ?? null;
    updateData.cover_path = dados.coverPath;
  }

  const { error } = await admin
    .from("tracks")
    .update(updateData)
    .eq("id", trackId);

  if (error) {
    return { error: "Não foi possível salvar as alterações." };
  }

  // Remove a capa antiga do Storage (se trocou e havia uma diferente).
  if (dados.coverPath && capaAntiga && capaAntiga !== dados.coverPath) {
    await admin.storage.from("tracks-covers").remove([capaAntiga]);
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
