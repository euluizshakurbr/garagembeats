import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import AdminNav from "@/components/AdminNav";
import AdminUpload from "@/components/AdminUpload";
import AdminTrackItem from "@/components/AdminTrackItem";
import { createClient } from "@/lib/supabase/server";
import { brandsOf } from "@/lib/brands";
import type { Track } from "@/lib/types";

export default async function AdminPage() {
  const t = await getTranslations("admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("tracks")
    .select("*")
    .order("created_at", { ascending: false });
  const tracks = (data ?? []) as Track[];

  // Marcas que já existem — alimentam o seletor (aprende sozinho).
  const brandOptions = [...new Set(tracks.flatMap((t) => brandsOf(t)))].sort();

  const items = tracks.map((track) => ({
    id: track.id,
    title: track.title,
    brands: brandsOf(track),
    estilo: track.estilo,
    coverUrl: track.cover_path
      ? supabase.storage.from("tracks-covers").getPublicUrl(track.cover_path)
          .data.publicUrl
      : null,
  }));

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <AdminNav />
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {t("novaMusicaTitulo")}
          </h1>
          <p className="mt-2 text-[#888]">{t("adicionarTrilha")}</p>
          <div className="mt-8">
            <AdminUpload brandOptions={brandOptions} />
          </div>

          <div className="mt-14">
            <h2 className="text-lg font-semibold text-white">
              Catálogo ({items.length})
            </h2>
            {items.length === 0 ? (
              <p className="mt-4 text-sm text-[#555]">
                Nenhuma música publicada ainda.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {items.map((track) => (
                  <AdminTrackItem
                    key={track.id}
                    track={track}
                    brandOptions={brandOptions}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
