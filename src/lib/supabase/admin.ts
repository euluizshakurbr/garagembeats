import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client com a service_role key — ignora RLS. Só usar em rotas server-only
// sem sessão de usuário (ex: webhooks), nunca expor ao navegador.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
