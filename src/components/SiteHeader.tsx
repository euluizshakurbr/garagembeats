import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Logo from "@/components/Logo";
import MobileNav from "@/components/MobileNav";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function SiteHeader() {
  let isLoggedIn = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    isLoggedIn = !!data.user;
  }

  const t = await getTranslations("nav");

  return (
    <header className="relative border-b border-[#1a1a1a] px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-[#888] sm:flex">
          <Link href="/catalogo" className="hover:text-white transition-colors">
            {t("catalogo")}
          </Link>
          <Link href="/planos" className="hover:text-white transition-colors">
            {t("planos")}
          </Link>
          <Link href="/encomenda" className="hover:text-white transition-colors">
            {t("encomenda")}
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/conta" className="hover:text-white transition-colors">
                {t("minhaConta")}
              </Link>
              <LogoutButton
                label={t("sair")}
                className="hover:text-white transition-colors"
              />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-[#CC1111] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
            >
              {t("entrar")}
            </Link>
          )}
          <LocaleSwitcher />
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <LocaleSwitcher />
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </header>
  );
}

