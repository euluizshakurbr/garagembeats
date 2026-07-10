import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Recebe o link de confirmação de email do Supabase, valida o token e cria a
// sessão (grava os cookies). Assim o usuário já cai no site logado.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/pt/conta";

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirectTo.pathname = next;
      return NextResponse.redirect(redirectTo);
    }
  }

  // Link inválido ou expirado — manda pro login com um aviso.
  redirectTo.pathname = "/pt/login";
  redirectTo.searchParams.set("erro", "confirmacao");
  return NextResponse.redirect(redirectTo);
}
