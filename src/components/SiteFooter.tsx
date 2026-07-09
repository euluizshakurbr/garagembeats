import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Troque aqui pelo e-mail de contato que você quer exibir no site.
const CONTACT_EMAIL = "suporteinfomogi@gmail.com";

export default async function SiteFooter() {
  const t = await getTranslations();
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1a1a1a] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="text-sm text-[#888]">{t("home.footerTagline")}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-[#555]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              {t("home.pagamentoSeguro")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:gap-12">
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-white">{t("home.footerNavegar")}</p>
              <Link href="/catalogo" className="text-[#888] transition-colors hover:text-white">
                {t("nav.catalogo")}
              </Link>
              <Link href="/planos" className="text-[#888] transition-colors hover:text-white">
                {t("nav.planos")}
              </Link>
              <Link href="/encomenda" className="text-[#888] transition-colors hover:text-white">
                {t("nav.encomenda")}
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-semibold text-white">{t("home.footerContato")}</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="break-all text-[#888] transition-colors hover:text-white"
              >
                {CONTACT_EMAIL}
              </a>
              <Link href="/termos" className="text-[#888] transition-colors hover:text-white">
                {t("home.termosUso")}
              </Link>
              <Link href="/privacidade" className="text-[#888] transition-colors hover:text-white">
                {t("home.privacidade")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#1a1a1a] pt-6 text-xs text-[#555]">
          <p>{t("home.footerCopyright", { ano })}</p>
          <p className="mt-1">
            Luiz Nascimento Mídia e Tecnologia · CNPJ 47.051.525/0001-10
          </p>
        </div>
      </div>
    </footer>
  );
}
