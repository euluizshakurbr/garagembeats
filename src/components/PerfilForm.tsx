"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { atualizarConta } from "@/app/[locale]/conta/actions";

export default function PerfilForm({
  nomeInicial,
  whatsappInicial,
}: {
  nomeInicial: string;
  whatsappInicial: string;
}) {
  const t = useTranslations("conta");
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState(nomeInicial);
  const [whatsapp, setWhatsapp] = useState(whatsappInicial);
  const [novaSenha, setNovaSenha] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const result = await atualizarConta({
      nome,
      whatsapp,
      novaSenha: novaSenha || undefined,
    });

    if (result.error) {
      setStatus("error");
      setErrorMessage(result.error);
      return;
    }
    setNovaSenha("");
    setStatus("ok");
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-4 text-sm font-semibold text-[#888] underline-offset-2 hover:text-white hover:underline"
      >
        {t("editarPerfil")}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#1a1a1a] bg-[#111] p-5"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="perfil-nome" className="text-sm font-medium text-white">
          {t("nomeLabel")}
        </label>
        <input
          id="perfil-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="perfil-wpp" className="text-sm font-medium text-white">
          {t("whatsappLabel")}
        </label>
        <input
          id="perfil-wpp"
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="perfil-senha" className="text-sm font-medium text-white">
          {t("novaSenhaOpcional")}
        </label>
        <input
          id="perfil-senha"
          type="password"
          value={novaSenha}
          minLength={6}
          onChange={(e) => setNovaSenha(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-[#CC1111]">{errorMessage}</p>
      )}
      {status === "ok" && (
        <p className="text-sm text-green-400">{t("perfilSalvo")}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-[#CC1111] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:opacity-60"
        >
          {status === "loading" ? t("salvando") : t("salvar")}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-xl border border-[#333] px-5 py-2.5 text-sm font-semibold text-[#888] hover:text-white"
        >
          {t("fechar")}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-2.5 text-white placeholder-[#555] outline-none transition-colors focus:border-[#CC1111]";
