import Link from "next/link";
import { getTranslations } from "next-intl/server";
import AuthForm from "@/components/AuthForm";
import SiteHeader from "@/components/SiteHeader";

export default async function CadastroPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <AuthForm mode="cadastro" redirectTo="/conta" />
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
