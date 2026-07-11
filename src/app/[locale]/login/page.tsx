import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import AuthForm from "@/components/AuthForm";
import SiteHeader from "@/components/SiteHeader";
import { resolveNext } from "@/i18n/paths";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const t = await getTranslations("auth");
  const locale = await getLocale();
  const redirectTo = resolveNext(next, locale);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <AuthForm mode="login" redirectTo={redirectTo} />
        <Link
          href="/esqueci-senha"
          className="mt-4 text-sm text-[#888] transition-colors hover:text-white hover:underline"
        >
          {t("esqueciSenhaLink")}
        </Link>
        <p className="mt-3 text-sm text-[#888]">
          {t("naoTemConta")}{" "}
          <Link href="/cadastro" className="text-white hover:underline">
            {t("criarAgora")}
          </Link>
        </p>
      </main>
    </div>
  );
}
