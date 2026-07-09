import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import AuthForm from "@/components/AuthForm";
import SiteHeader from "@/components/SiteHeader";
import { localizedPath } from "@/i18n/paths";

export default async function CadastroPage() {
  const t = await getTranslations("auth");
  const locale = await getLocale();
  const redirectTo = localizedPath("/conta", locale);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <AuthForm mode="cadastro" redirectTo={redirectTo} />
        <p className="mt-4 text-sm text-[#888]">
          {t("jaTemConta")}{" "}
          <Link href="/login" className="text-white hover:underline">
            {t("entrar")}
          </Link>
        </p>
      </main>
    </div>
  );
}
