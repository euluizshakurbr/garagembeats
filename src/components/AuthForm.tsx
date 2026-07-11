"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { trackMeta } from "@/lib/meta";

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

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  }

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

    // Conta criada com sucesso — evento de conversão (Meta Pixel)
    trackMeta("CompleteRegistration");

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

      <button
        type="button"
        onClick={handleGoogle}
        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-2.5 font-semibold text-[#111] transition-colors hover:bg-[#eaeaea]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {t("continuarGoogle")}
      </button>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#1a1a1a]" />
        <span className="text-xs text-[#555]">{t("ouEmail")}</span>
        <span className="h-px flex-1 bg-[#1a1a1a]" />
      </div>

      <div className="flex flex-col gap-4">
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

