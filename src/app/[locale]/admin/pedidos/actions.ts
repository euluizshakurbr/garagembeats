"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function marcarEmProducao(encomendaId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("encomendas")
    .update({ status: "em_producao" })
    .eq("id", encomendaId);

  if (error) {
    return { error: "Não foi possível atualizar o status." };
  }

  revalidatePath("/admin/pedidos");
  return { ok: true };
}

export async function entregarEncomenda(formData: FormData) {
  const supabase = await createClient();

  const encomendaId = formData.get("encomendaId") as string;
  const userId = formData.get("userId") as string;
  const audioFile = formData.get("audio") as File;

  if (!encomendaId || !userId || !audioFile || audioFile.size === 0) {
    return { error: "Selecione o arquivo de áudio." };
  }

  const ext = audioFile.name.split(".").pop();
  const audioPath = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("encomendas-audio")
    .upload(audioPath, audioFile);

  if (uploadError) {
    console.error("Erro ao enviar entrega da encomenda:", uploadError);
    return { error: `Falha ao enviar o arquivo: ${uploadError.message}` };
  }

  const { error: updateError } = await supabase
    .from("encomendas")
    .update({ status: "entregue", audio_path: audioPath })
    .eq("id", encomendaId);

  if (updateError) {
    console.error("Erro ao marcar encomenda como entregue:", updateError);
    return { error: `Falha ao salvar a entrega: ${updateError.message}` };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/conta");
  return { ok: true };
}
