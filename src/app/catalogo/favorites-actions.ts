"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorito(trackId: string, currentlyFavorited: boolean) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Você precisa entrar na sua conta." };
  }

  if (currentlyFavorited) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userData.user.id)
      .eq("track_id", trackId);
    if (error) return { error: "Não foi possível remover dos favoritos." };
  } else {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userData.user.id, track_id: trackId });
    if (error) return { error: "Não foi possível favoritar." };
  }

  revalidatePath("/catalogo");
  revalidatePath("/conta");
  return { ok: true, favorited: !currentlyFavorited };
}
