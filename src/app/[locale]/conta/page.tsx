import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import DownloadButton from "@/components/DownloadButton";
import TrackDownloadButton from "@/components/TrackDownloadButton";
import EncomendaDownloadButton from "@/components/EncomendaDownloadButton";
import SupabaseSetupNotice from "@/components/SupabaseSetupNotice";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getPlan, getPlanPreco } from "@/lib/plans";
import {
  confirmarPagamentoEncomenda,
  confirmarAssinatura,
} from "@/app/[locale]/conta/confirmar-pagamento";
import type { DownloadLog, Encomenda, Favorite, Subscription } from "@/lib/types";

export default async function ContaPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string; plano?: string }>;
}) {
  const t = await getTranslations("conta");
  const locale = await getLocale();

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "pt-BR");
  }

  const STATUS_LABEL: Record<Encomenda["status"], string> = {
    pendente: t("statusPendente"),
    em_producao: t("statusEmProducao"),
    entregue: t("statusEntregue"),
  };

  const { pedido, plano } = await searchParams;
  if (pedido) {
    await confirmarPagamentoEncomenda(pedido);
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <main className="flex-1 px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {t("titulo")}
            </h1>
            <SupabaseSetupNotice />
          </div>
        </main>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (plano) {
    await confirmarAssinatura(userData.user!.id, plano);
  }

  const { data: subscriptionData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userData.user!.id)
    .eq("status", "active")
    .maybeSingle();
  const subscription = subscriptionData as Subscription | null;
  const plan = subscription ? getPlan(subscription.plan) : null;
  const preco = plan ? getPlanPreco(plan, locale) : null;

  let downloadsUsed = 0;
  if (subscription) {
    const { count } = await supabase
      .from("downloads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userData.user!.id)
      .gte("created_at", subscription.current_period_start);
    downloadsUsed = count ?? 0;
  }

  const { data: downloads } = await supabase
    .from("downloads")
    .select("*, track:tracks(*)")
    .eq("user_id", userData.user!.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: encomendasData } = await supabase
    .from("encomendas")
    .select("*")
    .eq("user_id", userData.user!.id)
    .order("created_at", { ascending: false });
  const encomendas = (encomendasData ?? []) as Encomenda[];

  const { data: favoritesData } = await supabase
    .from("favorites")
    .select("*, track:tracks(*)")
    .eq("user_id", userData.user!.id)
    .order("created_at", { ascending: false });
  const favorites = (favoritesData ?? []) as unknown as Favorite[];

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {t("titulo")}
          </h1>
          <p className="mt-2 text-[#888]">{userData.user!.email}</p>

          {pedido && (
            <div className="mt-6 rounded-xl border border-[#CC1111]/40 bg-[#1a0808] p-4 text-sm text-white">
              {t("pagamentoEncomendaRecebido")}
            </div>
          )}

          {plano && (
            <div className="mt-6 rounded-xl border border-[#CC1111]/40 bg-[#1a0808] p-4 text-sm text-white">
              {t("pagamentoAssinaturaRecebido")}
            </div>
          )}

          <div
            className={`mt-8 rounded-2xl border p-6 ${
              plan
                ? "border-[#1a1a1a] bg-[#111]"
                : "border-[#CC1111]/40 bg-gradient-to-b from-[#1a0808] to-[#111]"
            }`}
          >
            {plan && preco ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#888]">
                  {t("seuPlano")}
                </p>
                <p className="mt-1 text-xl font-bold text-white">
                  {plan.name} — {preco.label}
                  {locale === "en" ? "/mo" : "/mês"}
                </p>
                <p className="mt-1 text-sm text-[#888]">
                  {plan.downloadLimit === null
                    ? t("downloadsUsadosIlimitado", { usados: downloadsUsed })
                    : t("downloadsUsadosLimite", {
                        usados: downloadsUsed,
                        limite: plan.downloadLimit,
                      })}
                </p>
                <Link
                  href="/planos"
                  className="mt-4 inline-flex rounded-xl border border-[#333] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#555]"
                >
                  {t("trocarPlano")}
                </Link>
              </>
            ) : (
              <>
                <p className="font-semibold text-white">{t("semPlanoTitulo")}</p>
                <p className="mt-1 text-sm text-[#888]">{t("semPlanoDesc")}</p>
                <Link
                  href="/planos"
                  className="mt-4 inline-flex rounded-xl bg-[#CC1111] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
                >
                  {t("verPlanos")}
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-[#1a1a1a] bg-[#111] p-6">
            <h2 className="font-semibold text-white">
              {t("musicaPersonalizadaTitulo")}
            </h2>
            <p className="mt-1 text-sm text-[#888]">
              {t("musicaPersonalizadaDesc")}
            </p>
            <Link
              href="/encomenda"
              className="mt-4 inline-flex rounded-xl border border-[#333] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#555]"
            >
              {t("pedirAgora")}
            </Link>
          </div>

          <h2 className="mt-10 text-lg font-semibold text-white">
            {t("minhasEncomendas")}
          </h2>

          {encomendas.length === 0 ? (
            <p className="mt-4 text-[#555]">
              {t("semEncomendas")}{" "}
              <Link href="/encomenda" className="text-white hover:underline">
                {t("pedirAgora")}
              </Link>
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {encomendas.map((encomenda) => (
                <div
                  key={encomenda.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1a1a1a] bg-[#111] p-4"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-[#888]">
                      {encomenda.codigo_pedido}
                    </p>
                    <p className="truncate font-medium text-white">
                      {encomenda.carro}
                    </p>
                    <p className="text-xs text-[#888]">
                      {STATUS_LABEL[encomenda.status]} ·{" "}
                      {formatDate(encomenda.created_at)}
                    </p>
                  </div>
                  {encomenda.status === "entregue" && encomenda.audio_path && (
                    <EncomendaDownloadButton
                      audioPath={encomenda.audio_path}
                      title={`Garagem Beats - ${encomenda.carro}`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <h2 className="mt-10 text-lg font-semibold text-white">
            {t("favoritos")}
          </h2>

          {favorites.length === 0 ? (
            <p className="mt-4 text-[#555]">
              {t("semFavoritos")}{" "}
              <Link href="/catalogo" className="text-white hover:underline">
                {t("verCatalogo")}
              </Link>
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {favorites.map((favorite) => (
                <div
                  key={favorite.track_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1a1a1a] bg-[#111] p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {favorite.track.title}
                    </p>
                    <p className="text-xs text-[#888]">
                      {favorite.track.brand}
                    </p>
                  </div>
                  <TrackDownloadButton
                    trackId={favorite.track_id}
                    audioPath={favorite.track.audio_path}
                    title={favorite.track.title}
                    isLoggedIn
                  />
                </div>
              ))}
            </div>
          )}

          <h2 className="mt-10 text-lg font-semibold text-white">
            {t("historicoDownloads")}
          </h2>

          {!downloads || downloads.length === 0 ? (
            <p className="mt-4 text-[#555]">
              {t("semDownloads")}{" "}
              <Link href="/catalogo" className="text-white hover:underline">
                {t("verCatalogo")}
              </Link>
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {(downloads as unknown as DownloadLog[]).map((download) => (
                <div
                  key={download.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1a1a1a] bg-[#111] p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {download.track.title}
                    </p>
                    <p className="text-xs text-[#888]">
                      {download.track.brand} · {formatDate(download.created_at)}
                    </p>
                  </div>
                  <DownloadButton
                    audioPath={download.track.audio_path}
                    title={download.track.title}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
