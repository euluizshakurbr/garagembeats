import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function SiteFooter() {
  const t = await getTranslations("home");

  return (
    <footer className="border-t border-[#1a1a1a] px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col-reverse items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-[#555]">
          {t("footerTagline")}
          <br />
          {t("footerCopyright", { ano: new Date().getFullYear() })}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#888]">
          <a
            href="https://wa.me/5500000000000"
            className="transition-colors hover:text-white"
          >
            WhatsApp
          </a>
          <a
            href="https://instagram.com/garagembeats"
            className="transition-colors hover:text-white"
          >
            Instagram
          </a>
          <Link href="/termos" className="transition-colors hover:text-white">
            {t("termosUso")}
          </Link>
          <Link
            href="/privacidade"
            className="transition-colors hover:text-white"
          >
            {t("privacidade")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
