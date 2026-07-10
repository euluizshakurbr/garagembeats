import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import type { Depoimento } from "@/lib/types";

function Estrelas({ nota }: { nota: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${nota} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill={i < nota ? "#CC1111" : "none"}
          stroke={i < nota ? "#CC1111" : "#3a3a3a"}
          strokeWidth="1.5"
        >
          <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default async function Depoimentos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("depoimentos")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(6);

  const depoimentos = (data ?? []) as Depoimento[];
  if (depoimentos.length === 0) return null;

  const t = await getTranslations("home");

  return (
    <section className="border-t border-[#1a1a1a] px-6 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <span className="inline-flex items-center rounded-full border border-[#1a1a1a] bg-[#111] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#888]">
          {t("depoimentosLabel")}
        </span>
        <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
          {t("depoimentosTitulo")}
        </h2>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {depoimentos.map((d) => (
            <div
              key={d.id}
              className="flex flex-col rounded-2xl border border-[#1a1a1a] bg-[#111] p-5"
            >
              {d.nota ? <Estrelas nota={d.nota} /> : null}
              <p className="mt-3 flex-1 text-sm text-[#ccc]">“{d.texto}”</p>
              <p className="mt-4 text-sm font-semibold text-white">
                {d.nome}
                {d.carro ? (
                  <span className="font-normal text-[#888]"> · {d.carro}</span>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
