import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Logo from "@/components/Logo";
import MobileNav from "@/components/MobileNav";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import LogoutButton from "@/components/LogoutButton";
import NavLink from "@/components/NavLink";
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
    <header className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-[#0A0A0A]/90 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
          <NavLink href="/catalogo" className={navPill} activeClassName={navPillActive}>
            {t("catalogo")}
          </NavLink>
          <NavLink href="/planos" className={navPill} activeClassName={navPillActive}>
            {t("planos")}
          </NavLink>
          <NavLink href="/encomenda" className={navPill} activeClassName={navPillActive}>
            {t("encomenda")}
          </NavLink>

          <span className="mx-2 h-5 w-px bg-[#1a1a1a]" aria-hidden="true" />

          {isLoggedIn ? (
            <>
              <NavLink href="/conta" className={navPill} activeClassName={navPillActive}>
                {t("minhaConta")}
              </NavLink>
              <LogoutButton
                label={t("sair")}
                className="rounded-lg px-3 py-2 text-[#666] transition-colors hover:text-white"
              />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-[#888] transition-colors hover:text-white"
              >
                {t("entrar")}
              </Link>
              <Link
                href="/cadastro"
                className="rounded-xl bg-[#CC1111] px-4 py-2 font-semibold text-white shadow-lg shadow-[#CC1111]/20 transition-colors hover:bg-[#aa0e0e]"
              >
                {t("criarConta")}
              </Link>
            </>
          )}
          <div className="ml-2">
            <LocaleSwitcher />
          </div>
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <LocaleSwitcher />
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </header>
  );
}

const navPill =
  "rounded-lg px-3 py-2 text-[#888] transition-colors hover:bg-[#161616] hover:text-white";
const navPillActive = "!bg-[#CC1111]/15 !text-white";

