import { getLocale, getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";

export default async function PrivacidadePage() {
  const locale = await getLocale();
  const t = await getTranslations("privacidade");
  const strong = {
    strong: (chunks: React.ReactNode) => (
      <strong className="text-white">{chunks}</strong>
    ),
  };

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {t("titulo")}
          </h1>
          <p className="mt-2 text-sm text-[#555]">
            {t("ultimaAtualizacao")}
            {new Date().toLocaleDateString(locale === "en" ? "en-US" : "pt-BR")}
          </p>

          <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-[#888]">
            <Secao titulo={t("secao1Titulo")}>
              <p>{t.rich("secao1Texto", strong)}</p>
            </Secao>

            <Secao titulo={t("secao2Titulo")}>
              <ul className="flex flex-col gap-2 list-disc pl-5">
                <li>{t.rich("secao2Item1", strong)}</li>
                <li>{t.rich("secao2Item2", strong)}</li>
                <li>{t.rich("secao2Item3", strong)}</li>
                <li>{t.rich("secao2Item4", strong)}</li>
              </ul>
            </Secao>

            <Secao titulo={t("secao3Titulo")}>
              <ul className="flex flex-col gap-2 list-disc pl-5">
                <li>{t("secao3Item1")}</li>
                <li>{t("secao3Item2")}</li>
                <li>{t("secao3Item3")}</li>
                <li>{t("secao3Item4")}</li>
                <li>{t("secao3Item5")}</li>
              </ul>
            </Secao>

            <Secao titulo={t("secao4Titulo")}>
              <p>{t("secao4Texto")}</p>
              <ul className="mt-2 flex flex-col gap-2 list-disc pl-5">
                <li>{t.rich("secao4Item1", strong)}</li>
                <li>{t.rich("secao4Item2", strong)}</li>
              </ul>
            </Secao>

            <Secao titulo={t("secao5Titulo")}>
              <p>{t("secao5Texto")}</p>
            </Secao>

            <Secao titulo={t("secao6Titulo")}>
              <p>{t("secao6Texto")}</p>
            </Secao>

            <Secao titulo={t("secao7Titulo")}>
              <p>{t("secao7Texto")}</p>
            </Secao>

            <Secao titulo={t("secao8Titulo")}>
              <p>{t("secao8Texto")}</p>
            </Secao>

            <Secao titulo={t("secao9Titulo")}>
              <p>{t("secao9Texto")}</p>
            </Secao>
          </div>
        </div>
      </main>
    </div>
  );
}

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white">{titulo}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
