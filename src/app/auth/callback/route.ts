import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Finaliza o login social (Google/Facebook): troca o "code" do OAuth por uma
// sessão (grava os cookies) e leva o usuário de volta pra onde ele estava.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/pt/conta";

  const redirectTo = request.nextUrl.clone();
  redirectTo.search = "";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirectTo.pathname = next;
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/pt/login";
  redirectTo.searchParams.set("erro", "oauth");
  return NextResponse.redirect(redirectTo);
}
