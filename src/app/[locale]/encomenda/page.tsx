import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/i18n/seo";
import { getEncomendaPreco } from "@/lib/plans";
import SiteHeader from "@/components/SiteHeader";
import SiteWizard from "@/components/SiteWizard";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations();
  const preco = getEncomendaPreco(locale);
  return {
    title: t("nav.encomenda"),
    description: t("encomenda.subtitulo", { preco: preco.label }),
    alternates: alternates("/encomenda", locale),
  };
}

export default function EncomendaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center">
        <SiteWizard />
      </main>
    </div>
  );
}
