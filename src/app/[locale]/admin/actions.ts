"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
