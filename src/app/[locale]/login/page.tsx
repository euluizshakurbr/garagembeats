import Link from "next/link";
import { getTranslations } from "next-intl/server";
import AuthForm from "@/components/AuthForm";
import SiteHeader from "@/components/SiteHeader";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <AuthForm mode="login" redirectTo={next || "/conta"} />
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
