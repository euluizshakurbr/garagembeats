"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({
  mode,
  redirectTo,
}: {
  mode: "login" | "cadastro";
  redirectTo: string;
}) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "confirmar"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function traduzErro(message: string) {
    const m = message.toLowerCase();
    if (m.includes("invalid login credentials")) return t("erroCredenciais");
    if (m.includes("email not confirmed")) return t("erroEmailNaoConfirmado");
    if (m.includes("already registered") || m.includes("already exists")) {
      return t("erroJaExiste");
    }
    if (m.includes("password should be at least") || m.includes("at least 6")) {
      return t("erroSenhaCurta");
    }
    return t("erroGenerico");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) {
        setStatus("error");
        setErrorMessage(traduzErro(error.message));
        return;
      }
      router.push(redirectTo);
      router.refresh();
      return;
    }

    // Cadastro
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome, whatsapp } },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(traduzErro(error.message));
      return;
    }

    // Sem sessão = confirmação de e-mail está ativada no Supabase.
    if (!data.session) {
      setStatus("confirmar");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  // Tela de "confirme seu e-mail" após o cadastro
  if (status === "confirmar") {
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
          {t("contaCriadaTitulo")}
        </h1>
        <p className="mt-3 text-sm text-[#ddd]">{t("contaCriada", { email })}</p>
        <p className="mt-4 text-xs text-[#888]">{t("reenviarEmail")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-[#1a1a1a] bg-[#111] p-6 sm:p-8"
    >
      <h1 className="text-xl font-bold text-white">
        {mode === "login" ? t("entrarTitulo") : t("criarContaTitulo")}
      </h1>

      <div className="mt-6 flex flex-col gap-4">
        {mode === "cadastro" && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nome" className="text-sm font-medium text-white">
                {t("nomeCompleto")}
              </label>
              <input
                id="nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder={t("nomePlaceholder")}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="whatsapp" className="text-sm font-medium text-white">
                {t("whatsappLabel")}
              </label>
              <input
                id="whatsapp"
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder={locale === "en" ? "+1 555 123 4567" : "(11) 91234-5678"}
                pattern={locale === "en" ? undefined : "^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$"}
                title={t("whatsappTitle")}
                className={inputClass}
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="senha" className="text-sm font-medium text-white">
            {t("senha")}
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
      </div>

      {status === "error" && (
        <p className="mt-4 text-sm text-[#CC1111]">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 w-full rounded-xl bg-[#CC1111] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading"
          ? t("aguarde")
          : mode === "login"
            ? t("entrar")
            : t("criarConta")}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-2.5 text-white placeholder-[#555] outline-none transition-colors focus:border-[#CC1111]";

