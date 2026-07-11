"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import TrackDownloadButton from "@/components/TrackDownloadButton";
import TrackPreviewPlayer from "@/components/TrackPreviewPlayer";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import { FlameIcon, ChevronDownIcon, SearchIcon } from "@/components/icons";
import type { Track } from "@/lib/types";

interface TrackWithExtras extends Track {
  coverUrl: string | null;
  downloadsTotal: number;
  downloads30d: number;
}

type Ordenacao = "recentes" | "mais_baixadas" | "em_alta";
type Visualizacao = "grade" | "lista";

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

function formatDuracao(segundos: number | null) {
  if (!segundos) return null;
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
}

export default function CatalogoGrid({
  tracks,
  isLoggedIn,
  favoritedIds,
}: {
  tracks: TrackWithExtras[];
  isLoggedIn: boolean;
  favoritedIds: string[];
}) {
  const t = useTranslations("catalogo");
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("todas");
  const [estilo, setEstilo] = useState("todos");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("recentes");
  const [visualizacao, setVisualizacao] = useState<Visualizacao>("grade");
  const highlightRef = useRef<HTMLDivElement>(null);

  const brands = useMemo(() => {
    const unique = Array.from(new Set(tracks.map((t) => t.brand)));
    return unique.sort();
  }, [tracks]);

  const estilos = useMemo(() => {
    const unique = Array.from(
      new Set(tracks.map((t) => t.estilo).filter(Boolean))
    ) as string[];
    return unique.sort();
  }, [tracks]);

  const [musicaDestacada, setMusicaDestacada] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const busca = params.get("search");
    if (busca) setSearch(busca);

    const id = params.get("musica");
    if (!id) return;
    setMusicaDestacada(id);
    requestAnimationFrame(() => {
      highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  const filtered = tracks
    .filter((track) => {
      const matchesBrand = brand === "todas" || track.brand === brand;
      const matchesEstilo = estilo === "todos" || track.estilo === estilo;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        track.title.toLowerCase().includes(q) ||
        track.brand.toLowerCase().includes(q);
      return matchesBrand && matchesEstilo && matchesSearch;
    })
    .sort((a, b) => {
      if (ordenacao === "mais_baixadas") {
        return b.downloadsTotal - a.downloadsTotal;
      }
      if (ordenacao === "em_alta") {
        return b.downloads30d - a.downloads30d;
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const temFiltro =
    search.trim() !== "" || brand !== "todas" || estilo !== "todos";

  function limparFiltros() {
    setSearch("");
    setBrand("todas");
    setEstilo("todos");
  }

  return (
    <div>
      {!isLoggedIn && (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#CC1111]/30 bg-gradient-to-b from-[#1a0808] to-[#111] px-5 py-4 sm:flex-row">
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CC1111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13" />
              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
              <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8" />
              <path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" />
            </svg>
            {t("gratisNudge")}
          </p>
          <Link
            href="/cadastro"
            className="shrink-0 rounded-xl bg-[#CC1111] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#aa0e0e]"
          >
            {t("gratisNudgeCta")}
          </Link>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:flex-1 sm:max-w-lg">
          <svg
            className="absolute top-1/2 left-4 -translate-y-1/2"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#888"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("buscarPlaceholder")}
            className="w-full rounded-2xl border border-[#2a2a2a] bg-[#111] py-3.5 pl-12 pr-4 text-base text-white outline-none transition-colors placeholder-[#666] focus:border-[#CC1111]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
            className="min-w-0 flex-1 rounded-xl border border-[#1a1a1a] bg-[#111] px-3 py-2.5 text-sm text-white outline-none focus:border-[#CC1111] sm:flex-none sm:px-4"
          >
            <option value="recentes">{t("recemAdicionadas")}</option>
            <option value="em_alta">{t("emAltaOrdenacao")}</option>
            <option value="mais_baixadas">{t("maisBaixadas")}</option>
          </select>

          <div className="flex rounded-xl border border-[#1a1a1a] p-1">
            <ViewButton
              active={visualizacao === "grade"}
              onClick={() => setVisualizacao("grade")}
              label={t("grade")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </ViewButton>
            <ViewButton
              active={visualizacao === "lista"}
              onClick={() => setVisualizacao("lista")}
              label={t("lista")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </ViewButton>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <BrandFilter brands={brands} value={brand} onChange={setBrand} />
      </div>

      {estilos.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <FilterButton
            label={t("todosOsEstilos")}
            active={estilo === "todos"}
            onClick={() => setEstilo("todos")}
            variant="secondary"
          />
          {estilos.map((e) => (
            <EstiloFilterButton
              key={e}
              value={e}
              active={estilo === e}
              onClick={() => setEstilo(e)}
            />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <p className="text-sm text-[#555]">
            {t("resultados", { n: filtered.length })}
          </p>
          {temFiltro && (
            <button
              type="button"
              onClick={limparFiltros}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#888] transition-colors hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
              {t("limparFiltros")}
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-[#555]">{t("nenhumaTrilha")}</p>
          {temFiltro && (
            <button
              type="button"
              onClick={limparFiltros}
              className="mt-3 rounded-xl border border-[#333] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#555]"
            >
              {t("limparFiltros")}
            </button>
          )}
        </div>
      ) : visualizacao === "grade" ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isLoggedIn={isLoggedIn}
              isFavorited={favoritedIds.includes(track.id)}
              isDestacada={track.id === musicaDestacada}
              highlightRef={track.id === musicaDestacada ? highlightRef : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-2">
          {filtered.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              isLoggedIn={isLoggedIn}
              isFavorited={favoritedIds.includes(track.id)}
              isDestacada={track.id === musicaDestacada}
              highlightRef={track.id === musicaDestacada ? highlightRef : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EstiloLabel({ value }: { value: string }) {
  const t = useTranslations("estilos");
  return <>{t(value as never)}</>;
}

function EstiloFilterButton({
  value,
  active,
  onClick,
}: {
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  const t = useTranslations("estilos");
  return (
    <FilterButton
      label={t(value as never)}
      active={active}
      onClick={onClick}
      variant="secondary"
    />
  );
}

function TrackCard({
  track,
  isLoggedIn,
  isFavorited,
  isDestacada,
  highlightRef,
}: {
  track: TrackWithExtras;
  isLoggedIn: boolean;
  isFavorited: boolean;
  isDestacada: boolean;
  highlightRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const t = useTranslations("catalogo");
  const isNovo = Date.now() - new Date(track.created_at).getTime() < SETE_DIAS_MS;
  const isEmAlta = track.downloads30d >= 3;
  const duracao = formatDuracao(track.duration_seconds);

  return (
    <div
      ref={highlightRef}
      className={`group flex flex-col rounded-2xl border bg-[#111] p-4 transition-colors ${
        isDestacada ? "border-[#CC1111]" : "border-[#1a1a1a] hover:border-[#333]"
      }`}
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1a0000] to-[#3a0a0a]">
        {track.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.coverUrl}
            alt={track.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <CoverFallbackIcon />
        )}

        {/* Capa inteira leva pra página da música */}
        <Link
          href={{ pathname: "/musica/[id]", params: { id: track.slug ?? track.id } }}
          aria-label={track.title}
          className="absolute inset-0 z-10"
        />

        <div className="pointer-events-none absolute top-2 left-2 z-20 flex flex-col gap-1">
          {isNovo && <Badge color="#CC1111">{t("novo")}</Badge>}
          {isEmAlta && (
            <Badge color="#E87A00">
              <span className="flex items-center gap-1">
                <FlameIcon /> {t("emAlta")}
              </span>
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2 z-30 flex gap-1.5">
          <FavoriteButton
            trackId={track.id}
            initialFavorited={isFavorited}
            isLoggedIn={isLoggedIn}
          />
          <ShareButton trackId={track.slug ?? track.id} />
        </div>

        {duracao && (
          <span className="pointer-events-none absolute bottom-2 right-2 z-20 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
            {duracao}
          </span>
        )}
      </div>
      <Link
        href={{ pathname: "/musica/[id]", params: { id: track.slug ?? track.id } }}
        className="mt-3 line-clamp-2 block text-sm font-semibold text-white transition-colors hover:text-[#CC1111]"
      >
        {track.title}
      </Link>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <Tag>{track.brand}</Tag>
        {track.estilo && (
          <Tag>
            <EstiloLabel value={track.estilo} />
          </Tag>
        )}
      </div>
      <div className="mt-auto flex flex-col gap-2 pt-3">
        {track.downloadsTotal > 0 && (
          <p className="text-[11px] text-[#555]">
            {track.downloadsTotal}{" "}
            {track.downloadsTotal === 1 ? t("download") : t("downloads")}
          </p>
        )}
        <TrackPreviewPlayer
          track={{
            id: track.id,
            title: track.title,
            brand: track.brand,
            coverUrl: track.coverUrl,
            audioPath: track.audio_path,
          }}
          full
        />
        <TrackDownloadButton
          trackId={track.id}
          audioPath={track.audio_path}
          title={track.title}
          isLoggedIn={isLoggedIn}
          full
        />
      </div>
    </div>
  );
}

function TrackRow({
  track,
  isLoggedIn,
  isFavorited,
  isDestacada,
  highlightRef,
}: {
  track: TrackWithExtras;
  isLoggedIn: boolean;
  isFavorited: boolean;
  isDestacada: boolean;
  highlightRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const t = useTranslations("catalogo");
  const isNovo = Date.now() - new Date(track.created_at).getTime() < SETE_DIAS_MS;
  const isEmAlta = track.downloads30d >= 3;
  const duracao = formatDuracao(track.duration_seconds);

  return (
    <div
      ref={highlightRef}
      className={`flex flex-col gap-2 rounded-xl border bg-[#111] p-3 transition-colors ${
        isDestacada ? "border-[#CC1111]" : "border-[#1a1a1a]"
      }`}
    >
      <div className="flex items-center gap-3">
        <Link
          href={{ pathname: "/musica/[id]", params: { id: track.slug ?? track.id } }}
          aria-label={track.title}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#1a0000] to-[#3a0a0a]"
        >
          {track.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.coverUrl}
              alt={track.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <CoverFallbackIcon size={18} />
          )}
        </Link>

        <TrackPreviewPlayer
          track={{
            id: track.id,
            title: track.title,
            brand: track.brand,
            coverUrl: track.coverUrl,
            audioPath: track.audio_path,
          }}
          className="shrink-0"
        />

        <Link
          href={{ pathname: "/musica/[id]", params: { id: track.slug ?? track.id } }}
          className="min-w-0 flex-1 truncate font-semibold text-white transition-colors hover:text-[#CC1111]"
        >
          {track.title}
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <Tag>{track.brand}</Tag>
          {isNovo && <Badge color="#CC1111">{t("novo")}</Badge>}
          {isEmAlta && (
            <Badge color="#E87A00">
              <FlameIcon />
            </Badge>
          )}
          {track.estilo && (
            <Tag>
              <EstiloLabel value={track.estilo} />
            </Tag>
          )}
          {duracao && <span className="text-[11px] text-[#555]">{duracao}</span>}
          {track.downloadsTotal > 0 && (
            <span className="text-[11px] text-[#555]">
              · {track.downloadsTotal}{" "}
              {track.downloadsTotal === 1 ? t("download") : t("downloads")}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <FavoriteButton
            trackId={track.id}
            initialFavorited={isFavorited}
            isLoggedIn={isLoggedIn}
          />
          <ShareButton trackId={track.slug ?? track.id} />
          <TrackDownloadButton
            trackId={track.id}
            audioPath={track.audio_path}
            title={track.title}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </div>
  );
}

function CoverFallbackIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M9 18V5l12-2v13"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="1.5" opacity="0.7" />
      <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-0.5 text-[11px] text-[#888]">
      {children}
    </span>
  );
}

function BrandFilter({
  brands,
  value,
  onChange,
}: {
  brands: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("catalogo");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(search.trim().toLowerCase())
  );

  function select(value: string) {
    onChange(value);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative inline-block w-full sm:w-64">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#1a1a1a] bg-[#111] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#555]"
      >
        <span className="truncate">
          {value === "todas" ? t("todasAsMarcas") : value}
        </span>
        <ChevronDownIcon className={`shrink-0 text-[#888] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#1a1a1a] bg-[#111] p-2 shadow-2xl">
          {brands.length > 8 && (
            <div className="relative mb-2">
              <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-[#555]" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("buscarMarca")}
                className="w-full rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder-[#555] focus:border-[#CC1111]"
              />
            </div>
          )}
          <div className="max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => select("todas")}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                value === "todas"
                  ? "bg-[#CC1111] text-white"
                  : "text-white hover:bg-[#1a1a1a]"
              }`}
            >
              {t("todasAsMarcas")}
            </button>
            {filteredBrands.length === 0 ? (
              <p className="px-3 py-2 text-sm text-[#555]">{t("nenhumaMarca")}</p>
            ) : (
              filteredBrands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => select(b)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    value === b
                      ? "bg-[#CC1111] text-white"
                      : "text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  {b}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
  variant = "primary",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
        active
          ? variant === "primary"
            ? "bg-[#CC1111] text-white"
            : "bg-[#E87A00] text-white"
          : "border border-[#333] text-white hover:border-[#555]"
      }`}
    >
      {label}
    </button>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
        active ? "bg-[#CC1111] text-white" : "text-[#888] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

