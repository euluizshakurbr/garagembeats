import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { alternates } from "@/i18n/seo";
import { Link } from "@/i18n/navigation";
import SiteHeader from "@/components/SiteHeader";
import SubscribeButton from "@/components/SubscribeButton";
import SupabaseSetupNotice from "@/components/SupabaseSetupNotice";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PLANS, getPlanPreco } from "@/lib/plans";
import type { Subscription } from "@/lib/types";
import { CheckIcon } from "@/components/icons";

function custoPorMusica(cents: number, downloadLimit: number | null, moeda: string) {
  if (!downloadLimit) return null;
  const valor = cents / 100 / downloadLimit;
  const formatado =
    moeda === "usd"
      ? `US$${valor.toFixed(2)}`
      : `R$${valor.toFixed(2).replace(".", ",")}`;
  return formatado;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations();
  return {
    title: t("nav.planos"),
    description: t("planos.subtitulo"),
    alternates: alternates("/planos", locale),
  };
}

export default async function PlanosPage() {
  const t = await getTranslations("planos");
  const locale = await getLocale();
  const configured = isSupabaseConfigured();
  let isLoggedIn = false;
  let currentPlan: string | null = null;

  if (configured) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    isLoggedIn = !!userData.user;

    if (userData.user) {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("status", "active")
        .maybeSingle();
      currentPlan = (data as Subscription | null)?.plan ?? null;
    }
  }

  const faqItems = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
    pergunta: t(`faq${n}Pergunta`),
    resposta: t(`faq${n}Resposta`),
  }));

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center rounded-full border border-[#1a1a1a] bg-[#111] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#888]">
            {t("assinaturaMensal")}
          </span>
          <h1 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
            {t("titulo")}
          </h1>
          <p className="mt-2 text-[#888]">{t("subtitulo")}</p>

          {configured && !isLoggedIn && (
            <div className="mx-auto mt-6 flex max-w-xl flex-col items-center justify-center gap-3 rounded-2xl border border-[#CC1111]/40 bg-gradient-to-b from-[#1a0808] to-[#111] px-5 py-4 sm:flex-row sm:justify-between">
              <p className="text-sm font-medium text-white">
                {t("gratisBanner")}
              </p>
              <Link
                href="/cadastro"
                className="shrink-0 rounded-xl bg-[#CC1111] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
              >
                {t("gratisBannerCta")}
              </Link>
            </div>
          )}

          {!configured && (
            <div className="mx-auto mt-8 max-w-md text-left">
              <SupabaseSetupNotice />
            </div>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => {
              const preco = getPlanPreco(plan, locale);
              const custo = custoPorMusica(preco.cents, plan.downloadLimit, preco.currency);
              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col overflow-visible border bg-transparent p-6 text-left ${
                    plan.popular
                      ? "border-[#CC1111] bg-gradient-to-b from-[#1a0808] to-[#111] sm:scale-105"
                      : "border-[#1a1a1a] bg-[#111]"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#CC1111] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                      {t("popular")}
                    </Badge>
                  )}
                  <CardHeader className="p-0 text-center">
                    <p className="text-sm font-medium text-[#888]">
                      {plan.name}
                    </p>
                    <p className="mt-2 text-4xl font-bold text-white">
                      {preco.label}
                      <span className="text-base font-normal text-[#888]">
                        {t("porMes")}
                      </span>
                    </p>
                    <p className="mt-3 text-sm font-semibold text-white">
                      {plan.downloadLimit === null
                        ? t("downloadsIlimitados")
                        : t("downloadsLimite", { limite: plan.downloadLimit })}
                    </p>
                    {custo && (
                      <p className="mt-0.5 text-xs text-[#555]">
                        {t("custoPorMusica", { valor: custo })}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="mt-6 flex-1 p-0">
                    <ul className="flex flex-col gap-2 text-sm text-[#888]">
                      {plan.encomendasIncluidas > 0 && (
                        <li className="flex items-start gap-2 font-semibold text-white">
                          <CheckIcon className="mt-0.5 shrink-0 text-[#CC1111]" />
                          {plan.encomendasIncluidas}{" "}
                          {plan.encomendasIncluidas === 1
                            ? t("musicaInclusaMes")
                            : t("musicasInclusasMes")}
                        </li>
                      )}
                      {[t("beneficio1"), t("beneficio2"), t("beneficio3"), t("beneficio4")].map(
                        (beneficio) => (
                          <li key={beneficio} className="flex items-start gap-2">
                            <CheckIcon className="mt-0.5 shrink-0 text-[#CC1111]" />
                            {beneficio}
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>

                  <CardContent className="mt-6 p-0">
                    {configured ? (
                      <SubscribeButton
                        planId={plan.id}
                        isLoggedIn={isLoggedIn}
                        isCurrent={currentPlan === plan.id}
                        highlighted={plan.popular}
                      />
                    ) : (
                      <span className="inline-flex w-full items-center justify-center rounded-xl border border-[#333] px-6 py-3 text-sm font-semibold text-[#555]">
                        {t("indisponivel")}
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="mt-6 text-xs text-[#555]">{t("pagamentoSeguro")}</p>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-2xl">
          <h2 className="text-center text-2xl font-bold text-white">
            {t("perguntasFrequentes")}
          </h2>
          <div className="mt-8 flex flex-col gap-4">
            {faqItems.map((item) => (
              <div
                key={item.pergunta}
                className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5"
              >
                <p className="font-semibold text-white">{item.pergunta}</p>
                <p className="mt-1 text-sm text-[#888]">{item.resposta}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
