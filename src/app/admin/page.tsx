import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import UploadTrackForm from "@/components/UploadTrackForm";

export default async function AdminPage() {
  const t = await getTranslations("admin");

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {t("novaMusicaTitulo")}
            </h1>
            <Link
              href="/admin/pedidos"
              className="rounded-xl border border-[#333] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#555]"
            >
              {t("verPedidos")}
            </Link>
          </div>
          <p className="mt-2 text-[#888]">{t("adicionarTrilha")}</p>
          <div className="mt-8">
            <UploadTrackForm />
          </div>
        </div>
      </main>
    </div>
  );
}
