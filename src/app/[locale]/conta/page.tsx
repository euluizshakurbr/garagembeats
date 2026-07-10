import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import DownloadButton from "@/components/DownloadButton";
import TrackDownloadButton from "@/components/TrackDownloadButton";
import EncomendaDownloadButton from "@/components/EncomendaDownloadButton";
import ManageSubscriptionButton from "@/components/ManageSubscriptionButton";
import LogoutButton from "@/components/LogoutButton";
import PerfilForm from "@/components/PerfilForm";
import PayOrderButton from "@/components/PayOrderButton";
import MetaPurchase from "@/components/MetaPurchase";
import SupabaseSetupNotice from "@/components/SupabaseSetupNotice";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getPlan, getPlanPreco, getEncomendaPreco } from "@/lib/plans";
import {
  confirmarPagamentoEncomenda,
  confirmarAssinatura,
} from "@/app/[locale]/conta/confirmar-pagamento";
import type { DownloadLog, Encomenda, Favorite, Subscription } from "@/lib/types";

export default async function ContaPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string; session_id?: string }>;
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

  const STATUS_STYLE: Record<Encomenda["status"], string> = {
    pendente: "bg-amber-500/15 text-amber-400",
    em_producao: "bg-blue-500/15 text-blue-400",
    entregue: "bg-green-500/15 text-green-400",
  };

  const { pedido, session_id } = await searchParams;
  if (pedido) {
    await confirmarPagamentoEncomenda(pedido);
  }
  if (session_id) {
    await confirmarAssinatura(session_id);
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

  const { data: profileData } = await supabase
    .from("profiles")
    .select("nome, whatsapp")
    .eq("id", userData.user!.id)
    .maybeSingle();
  const profile = (profileData ?? {}) as {
    nome?: string | null;
    whatsapp?: string | null;
  };

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
  let freeDownloadAvailable = false;
  if (subscription) {
    const { count } = await supabase
      .from("downloads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userData.user!.id)
      .gte("created_at", subscription.current_period_start);
    downloadsUsed = count ?? 0;
  } else {
    const { count } = await supabase
      .from("downloads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userData.user!.id);
    freeDownloadAvailable = (count ?? 0) === 0;
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2.5 text-3xl font-bold text-white sm:text-4xl">
                {profile.nome && (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#CC1111"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
                    <path d="M14 10V4a2 2 0 0 0-4 0v6" />
                    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
                    <path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                  </svg>
                )}
                <span className="truncate">
                  {profile.nome ? t("ola", { nome: profile.nome }) : t("titulo")}
                </span>
              </h1>
              <p className="mt-2 text-[#888]">{userData.user!.email}</p>
            </div>
            <LogoutButton
              label={t("sair")}
              className="shrink-0 rounded-xl border border-[#333] px-4 py-2 text-sm font-semibold text-[#888] transition-colors hover:border-[#555] hover:text-white"
            />
          </div>

          <PerfilForm
            nomeInicial={profile.nome ?? ""}
            whatsappInicial={profile.whatsapp ?? ""}
          />

          {pedido && (
            <>
              <MetaPurchase
                value={getEncomendaPreco(locale).cents / 100}
                currency={getEncomendaPreco(locale).currency}
                eventId={`enc_${pedido}`}
              />
              <div className="mt-6 rounded-xl border border-[#CC1111]/40 bg-[#1a0808] p-4 text-sm text-white">
                {t("pagamentoEncomendaRecebido")}
              </div>
            </>
          )}

          {session_id && preco && (
            <MetaPurchase
              value={preco.cents / 100}
              currency={preco.currency}
              eventId={`sub_${session_id}`}
            />
          )}
          {session_id && (
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
                {plan.downloadLimit === null ? (
                  <p className="mt-1 text-sm text-[#888]">
                    {t("downloadsUsadosIlimitado", { usados: downloadsUsed })}
                  </p>
                ) : (
                  <div className="mt-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                      <div
                        className="h-full rounded-full bg-[#CC1111] transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (downloadsUsed / plan.downloadLimit) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-[#888]">
                      {t("downloadsRestantes", {
                        n: Math.max(0, plan.downloadLimit - downloadsUsed),
                      })}
                    </p>
                  </div>
                )}
                {subscription?.current_period_end && (
                  <p className="mt-1 text-xs text-[#555]">
                    {locale === "en" ? "Renews on " : "Renova em "}
                    {formatDate(subscription.current_period_end)}
                  </p>
                )}
                <ManageSubscriptionButton
                  label={
                    locale === "en"
                      ? "Manage subscription"
                      : "Gerenciar assinatura"
                  }
                />
              </>
            ) : (
              <>
                <p className="font-semibold text-white">{t("semPlanoTitulo")}</p>
                {freeDownloadAvailable && (
                  <p className="mt-2 rounded-lg border border-[#CC1111]/40 bg-[#1a0808] px-3 py-2 text-sm font-medium text-white">
                    {t("gratisDisponivel")}
                  </p>
                )}
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
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[encomenda.status]}`}
                      >
                        {STATUS_LABEL[encomenda.status]}
                      </span>
                      {!encomenda.pagamento_confirmado && (
                        <span className="rounded-full bg-[#CC1111]/15 px-2 py-0.5 text-[11px] font-semibold text-[#CC1111]">
                          {t("pagamentoPendente")}
                        </span>
                      )}
                      <span className="text-xs text-[#888]">
                        {formatDate(encomenda.created_at)}
                      </span>
                    </div>
                  </div>
                  {encomenda.status === "entregue" && encomenda.audio_path ? (
                    <EncomendaDownloadButton
                      audioPath={encomenda.audio_path}
                      title={`Garagem Beats - ${encomenda.carro}`}
                    />
                  ) : !encomenda.pagamento_confirmado ? (
                    <PayOrderButton
                      encomendaId={encomenda.id}
                      label={t("pagar")}
                    />
                  ) : null}
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
