"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const t = useTranslations("auth");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    if (senha !== confirmar) {
      setStatus("error");
      setErrorMessage(t("erroSenhasDiferentes"));
      return;
    }

    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setStatus("error");
      // Sem sessão de recuperação válida = link expirado/inválido.
      setErrorMessage(
        error.message.toLowerCase().includes("at least")
          ? t("erroSenhaCurta")
          : t("erroLinkInvalido")
      );
      return;
    }

    setStatus("done");
  }

  if (status === "done") {
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
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="m9 11 3 3L22 4" />
        </svg>
        <h1 className="mt-4 text-xl font-bold text-white">
          {t("senhaAtualizadaTitulo")}
        </h1>
        <p className="mt-3 text-sm text-[#ddd]">{t("senhaAtualizada")}</p>
        <Link
          href="/conta"
          className="mt-5 inline-flex rounded-xl bg-[#CC1111] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
        >
          {t("irParaConta")}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-[#1a1a1a] bg-[#111] p-6 sm:p-8"
    >
      <h1 className="text-xl font-bold text-white">{t("novaSenhaTitulo")}</h1>
      <p className="mt-2 text-sm text-[#888]">{t("novaSenhaDesc")}</p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="senha" className="text-sm font-medium text-white">
            {t("novaSenha")}
          </label>
          <input
            id="senha"
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmar" className="text-sm font-medium text-white">
            {t("confirmarNovaSenha")}
          </label>
          <input
            id="confirmar"
            type="password"
            required
            minLength={6}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>
      </div>

      {status === "error" && (
        <p className="mt-4 text-sm text-[#CC1111]">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 w-full rounded-xl bg-[#CC1111] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? t("aguarde") : t("salvarSenha")}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-2.5 text-white placeholder-[#555] outline-none transition-colors focus:border-[#CC1111]";
