"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function subirMusica(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const brand = formData.get("brand") as string;
  const estilo = formData.get("estilo") as string;
  const audioFile = formData.get("audio") as File;
  const coverFile = formData.get("cover") as File | null;
  const durationRaw = formData.get("duration") as string;
  const duration = durationRaw ? parseInt(durationRaw, 10) : null;

  if (!title || !brand || !audioFile) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const audioExt = audioFile.name.split(".").pop();
  const audioPath = `${crypto.randomUUID()}.${audioExt}`;

  const { error: audioError } = await supabase.storage
    .from("tracks-audio")
    .upload(audioPath, audioFile);
  if (audioError) {
    console.error("Erro ao enviar áudio para o Storage:", audioError);
    return { error: `Falha ao enviar o arquivo de áudio: ${audioError.message}` };
  }

  let coverPath: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const coverExt = coverFile.name.split(".").pop();
    coverPath = `${crypto.randomUUID()}.${coverExt}`;
    const { error: coverError } = await supabase.storage
      .from("tracks-covers")
      .upload(coverPath, coverFile);
    if (coverError) {
      console.error("Erro ao enviar capa para o Storage:", coverError);
      return { error: `Falha ao enviar a capa: ${coverError.message}` };
    }
  }

  const { error: insertError } = await supabase.from("tracks").insert({
    title,
    brand,
    estilo: estilo || null,
    audio_path: audioPath,
    cover_path: coverPath,
    duration_seconds: duration,
  });

  if (insertError) {
    console.error("Erro ao salvar música no banco:", insertError);
    return { error: `Falha ao salvar a música no catálogo: ${insertError.message}` };
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin");
  return { ok: true };
}
