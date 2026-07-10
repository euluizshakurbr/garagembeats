"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { localizedPath } from "@/i18n/paths";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}${localizedPath("/redefinir-senha", locale)}`;
    await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    // Mostra sucesso sempre, sem revelar se o e-mail existe (segurança).
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-[#CC1111]/40 bg-[#1a0808] p-6 text-center sm:p-8">
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#CC1111"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto"
          aria-hidden="true"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path d="m22 6-10 7L2 6" />
        </svg>
        <p className="mt-4 text-sm text-[#ddd]">{t("esqueciEnviado")}</p>
        <Link
          href="/login"
          className="mt-5 inline-block text-sm text-white underline underline-offset-2 hover:text-[#CC1111]"
        >
          {t("voltarLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-[#1a1a1a] bg-[#111] p-6 sm:p-8"
    >
      <h1 className="text-xl font-bold text-white">{t("esqueciTitulo")}</h1>
      <p className="mt-2 text-sm text-[#888]">{t("esqueciDesc")}</p>

      <div className="mt-6 flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-white">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 w-full rounded-xl bg-[#CC1111] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? t("aguarde") : t("enviarLink")}
      </button>

      <Link
        href="/login"
        className="mt-4 block text-center text-sm text-[#888] transition-colors hover:text-white"
      >
        {t("voltarLogin")}
      </Link>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-2.5 text-white placeholder-[#555] outline-none transition-colors focus:border-[#CC1111]";
