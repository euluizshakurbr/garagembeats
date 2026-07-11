"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LogoutButton from "@/components/LogoutButton";
import NavLink from "@/components/NavLink";

export default function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("abrirMenu")}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1a1a1a] text-white"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute inset-x-0 top-full z-50 border-b border-[#1a1a1a] bg-[#0A0A0A] px-4 py-3 shadow-2xl">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <NavLink
              href="/catalogo"
              onClick={() => setOpen(false)}
              className={mobilePill}
              activeClassName={mobilePillActive}
            >
              {t("catalogo")}
            </NavLink>
            <NavLink
              href="/planos"
              onClick={() => setOpen(false)}
              className={mobilePill}
              activeClassName={mobilePillActive}
            >
              {t("planos")}
            </NavLink>
            <NavLink
              href="/encomenda"
              onClick={() => setOpen(false)}
              className={mobilePill}
              activeClassName={mobilePillActive}
            >
              {t("encomenda")}
            </NavLink>

            <span className="my-1 h-px bg-[#1a1a1a]" aria-hidden="true" />

            {isLoggedIn ? (
              <>
                <NavLink
                  href="/conta"
                  onClick={() => setOpen(false)}
                  className={mobilePill}
                  activeClassName={mobilePillActive}
                >
                  {t("minhaConta")}
                </NavLink>
                <LogoutButton
                  label={t("sair")}
                  className="rounded-lg px-3 py-2.5 text-left text-[#666] transition-colors hover:text-white"
                />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[#888] transition-colors hover:text-white"
                >
                  {t("entrar")}
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setOpen(false)}
                  className="mt-1 inline-flex items-center justify-center rounded-xl bg-[#CC1111] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
                >
                  {t("criarConta")}
                </Link>
              </>
            )}
          </div>
          </nav>
        </>
      )}
    </div>
  );
}

const mobilePill =
  "rounded-lg px-3 py-2.5 text-[#888] transition-colors hover:bg-[#161616] hover:text-white";
const mobilePillActive = "!bg-[#CC1111]/15 !text-white";

