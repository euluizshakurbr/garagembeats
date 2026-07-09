import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// Slugs protegidos (em pt e en). /admin cobre /admin/pedidos e /admin/orders.
const PROTECTED_SLUGS = [
  "/conta",
  "/account",
  "/admin",
  "/encomenda",
  "/custom-music",
];

// Mapa reverso: slug localizado -> rota canônica (para o parâmetro ?next=)
const CANONICAL_BY_SLUG: Record<string, string> = {};
for (const [canonical, value] of Object.entries(routing.pathnames)) {
  if (typeof value === "string") {
    CANONICAL_BY_SLUG[value] = canonical;
  } else {
    for (const slug of Object.values(value)) {
      CANONICAL_BY_SLUG[slug] = canonical;
    }
  }
}

function isSupabaseConfigured() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "placeholder" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder"
  );
}

function stripLocale(pathname: string): { locale: string; rest: string } {
  const match = pathname.match(/^\/(pt|en)(\/.*)?$/);
  if (match) {
    return { locale: match[1], rest: match[2] || "/" };
  }
  return { locale: routing.defaultLocale, rest: pathname };
}

// No Next 16 o "middleware" foi renomeado para "proxy" (a convenção antiga
// middleware.ts é deprecada). Toda a lógica de i18n + auth vive aqui.
export async function proxy(request: NextRequest) {
  // 1. Roteamento i18n: cuida do redirect de "/", prefixo de locale e
  //    reescrita dos slugs traduzidos (/en/plans -> rota interna /planos).
  const response = handleI18nRouting(request);

  // Se o next-intl já emitiu um redirect (ex: "/" -> "/pt"), devolve na hora.
  if (response.headers.get("location")) {
    return response;
  }

  if (!isSupabaseConfigured()) {
    return response;
  }

  // 2. Autenticação Supabase — grava/atualiza cookies na resposta do i18n.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    await supabase.auth.signOut();
  }

  const { locale, rest } = stripLocale(request.nextUrl.pathname);
  const isProtected = PROTECTED_SLUGS.some(
    (p) => rest === p || rest.startsWith(`${p}/`)
  );

  if (isProtected && !data.user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    // Guarda a rota canônica pra voltar depois do login.
    const canonical = CANONICAL_BY_SLUG[rest] || rest;
    url.searchParams.set("next", canonical);
    return NextResponse.redirect(url);
  }

  if ((rest === "/admin" || rest.startsWith("/admin/")) && data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/${locale === "en" ? "account" : "conta"}`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Aplica a todas as rotas exceto api, estáticos e arquivos de mídia.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|mp3|wav)$).*)",
  ],
};
