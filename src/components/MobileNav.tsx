"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LogoutButton from "@/components/LogoutButton";

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
        <nav className="absolute inset-x-0 top-full border-b border-[#1a1a1a] bg-[#0A0A0A] px-6 py-4">
          <div className="flex flex-col gap-4 text-sm text-[#888]">
            <Link
              href="/catalogo"
              onClick={() => setOpen(false)}
              className="hover:text-white"
            >
              {t("catalogo")}
            </Link>
            <Link
              href="/planos"
              onClick={() => setOpen(false)}
              className="hover:text-white"
            >
              {t("planos")}
            </Link>
            <Link
              href="/encomenda"
              onClick={() => setOpen(false)}
              className="hover:text-white"
            >
              {t("encomenda")}
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/conta"
                  onClick={() => setOpen(false)}
                  className="hover:text-white"
                >
                  {t("minhaConta")}
                </Link>
                <LogoutButton
                  label={t("sair")}
                  className="w-fit text-left hover:text-white"
                />
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex w-fit rounded-xl bg-[#CC1111] px-4 py-2 font-semibold text-white"
              >
                {t("entrar")}
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

