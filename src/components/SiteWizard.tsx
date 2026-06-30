"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { criarEncomenda } from "@/app/encomenda/actions";
import { ESTILOS } from "@/lib/estilos";
import { getEncomendaPreco } from "@/lib/plans";
import { CheckIcon } from "@/components/icons";

type Status = "idle" | "submitting" | "success" | "error";

export default function SiteWizard() {
  const t = useTranslations("encomenda");
  const tEstilos = useTranslations("estilos");
  const locale = useLocale();
  const preco = getEncomendaPreco(locale).label;
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const IDIOMAS = [
    { value: "portugues", label: t("idiomaPortugues") },
    { value: "ingles", label: t("idiomaIngles") },
    { value: "espanhol", label: t("idiomaEspanhol") },
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    const result = await criarEncomenda({
      nome: formData.get("nome") as string,
      whatsapp: formData.get("whatsapp") as string,
      email: formData.get("email") as string,
      carro: formData.get("carro") as string,
      historia: formData.get("historia") as string,
      estilo: formData.get("estilo") as string,
      idioma: formData.get("idioma") as string,
    });

    if (result.ok) {
      setStatus("success");
      return;
    }

    if (result.error || !result.checkoutUrl) {
      setStatus("error");
      setErrorMessage(result.error ?? t("erroIniciarPagamento"));
      return;
    }

    window.location.href = result.checkoutUrl;
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#1a1a1a] bg-[#111] p-8 text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#CC1111]/15 text-[#CC1111]">
          <CheckIcon />
        </div>
        <h3 className="text-xl font-semibold text-white">{t("pedidoRecebido")}</h3>
        <p className="mt-2 text-[#888]">
          {t("pedidoRecebidoDesc")}{" "}
          <a href="/conta" className="text-white hover:underline">
            {t("minhasEncomendas")}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl px-6 py-10 sm:py-14">
      <div className="text-center">
        <span className="inline-flex items-center rounded-full border border-[#1a1a1a] bg-[#111] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#888]">
          {t("badge")}
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
          {t("tituloLinha1")}
          <br />
          {t("tituloLinha2")}
        </h1>
        <p className="mt-5 text-lg text-[#888] sm:text-xl">
          {t("subtitulo", { preco })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10">
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#111] p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-white">{t("seusDados")}</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label={t("nomeCompleto")} htmlFor="nome">
              <input
                id="nome"
                name="nome"
                required
                placeholder={t("nomePlaceholder")}
                className={inputClass}
              />
            </Field>
            <Field label={t("whatsapp")} htmlFor="whatsapp" hint={t("whatsappHint")}>
              <input
                id="whatsapp"
                name="whatsapp"
                required
                placeholder={locale === "en" ? "+1 555 123 4567" : "(11) 91234-5678"}
                pattern={locale === "en" ? undefined : "^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$"}
                title={t("whatsappTitle")}
                className={inputClass}
              />
            </Field>
            <Field label={t("emailOpcional")} htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                className={inputClass}
              />
            </Field>
            <Field label={t("carro")} htmlFor="carro">
              <input
                id="carro"
                name="carro"
                required
                placeholder={t("carroPlaceholder")}
                className={inputClass}
              />
            </Field>
          </div>

          <h2 className="mt-8 text-lg font-semibold text-white">
            {t("suaMusica")}
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label={t("estiloMusical")} htmlFor="estilo">
              <select id="estilo" name="estilo" required className={inputClass}>
                <option value="">{t("estiloPlaceholder")}</option>
                {ESTILOS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {tEstilos(opt.value as never)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("idioma")} htmlFor="idioma">
              <select id="idioma" name="idioma" required className={inputClass}>
                <option value="">{t("idiomaPlaceholder")}</option>
                {IDIOMAS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field
                label={t("historiaLabel")}
                htmlFor="historia"
                hint={t("historiaHint")}
              >
                <textarea
                  id="historia"
                  name="historia"
                  required
                  rows={4}
                  placeholder={t("historiaPlaceholder")}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </div>

        {status === "error" && (
          <p className="mt-4 text-center text-sm text-[#CC1111]">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-6 w-full rounded-xl bg-[#CC1111] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#aa0e0e] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "submitting"
            ? t("abrindoPagamento")
            : t("continuarPagamento", { preco })}
        </button>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#1a1a1a] bg-[#0A0A0A] px-4 py-2.5 text-white placeholder-[#555] outline-none transition-colors focus:border-[#CC1111]";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-white">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[#888]">{hint}</p>}
    </div>
  );
}
