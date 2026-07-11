import { createAdminClient } from "@/lib/supabase/admin";

// Assina os links de preview em lote, no servidor, pra entregar junto com as
// faixas — assim o play é instantâneo (sem ida/volta ao servidor no clique).
// Validade de 2h cobre uma sessão de navegação; se expirar, o player regenera.
export async function assinarPreviews(
  paths: (string | null | undefined)[]
): Promise<Record<string, string>> {
  const unicos = [...new Set(paths.filter((p): p is string => !!p))];
  if (unicos.length === 0) return {};

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("tracks-audio")
    .createSignedUrls(unicos, 7200);

  const mapa: Record<string, string> = {};
  if (!error && data) {
    for (const item of data) {
      if (item.signedUrl && item.path) {
        mapa[item.path] = item.signedUrl;
      }
    }
  }
  return mapa;
}
