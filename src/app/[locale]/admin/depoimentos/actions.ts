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

export async function adicionarDepoimento(dados: {
  nome: string;
  carro: string;
  texto: string;
  nota: number | null;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user || !(await isAdmin(supabase, userData.user.id))) {
    return { error: "Sem permissão." };
  }
  if (!dados.nome.trim() || !dados.texto.trim()) {
    return { error: "Preencha nome e depoimento." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("depoimentos").insert({
    nome: dados.nome.trim(),
    carro: dados.carro.trim() || null,
    texto: dados.texto.trim(),
    nota: dados.nota,
  });

  if (error) {
    return { error: "Não foi possível salvar o depoimento." };
  }

  revalidatePath("/admin/depoimentos");
  revalidatePath("/");
  revalidatePath("/planos");
  return { ok: true };
}

export async function excluirDepoimento(id: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user || !(await isAdmin(supabase, userData.user.id))) {
    return { error: "Sem permissão." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("depoimentos").delete().eq("id", id);
  if (error) {
    return { error: "Não foi possível excluir." };
  }

  revalidatePath("/admin/depoimentos");
  revalidatePath("/");
  revalidatePath("/planos");
  return { ok: true };
}
