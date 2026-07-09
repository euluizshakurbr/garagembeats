"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

// O arquivo de áudio é enviado direto do navegador pro Supabase Storage
// (ver DeliverOrderForm), evitando o limite de corpo do server action (4,5MB
// na Vercel). Aqui só marcamos a encomenda como entregue com o caminho.
export async function entregarEncomenda(encomendaId: string, audioPath: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user || !(await isAdmin(supabase, userData.user.id))) {
    return { error: "Sem permissão." };
  }

  if (!encomendaId || !audioPath) {
    return { error: "Selecione o arquivo de áudio." };
  }

  const { error: updateError } = await supabase
    .from("encomendas")
    .update({ status: "entregue", audio_path: audioPath })
    .eq("id", encomendaId);

  if (updateError) {
    console.error("Erro ao marcar encomenda como entregue:", updateError);
    return { error: "Falha ao salvar a entrega. Tente novamente." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/conta");
  return { ok: true };
}
