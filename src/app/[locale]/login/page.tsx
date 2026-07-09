import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import AuthForm from "@/components/AuthForm";
import SiteHeader from "@/components/SiteHeader";
import { localizedPath } from "@/i18n/paths";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const t = await getTranslations("auth");
  const locale = await getLocale();
  const redirectTo = localizedPath(next || "/conta", locale);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <AuthForm mode="login" redirectTo={redirectTo} />
        <p className="mt-4 text-sm text-[#888]">
          {t("naoTemConta")}{" "}
          <Link href="/cadastro" className="text-white hover:underline">
            {t("criarAgora")}
          </Link>
        </p>
      </main>
    </div>
  );
}
