import type { Track } from "@/lib/types";

// Marcas de uma música. Usa a lista nova "brands"; se estiver vazia (dados
// antigos), cai pra marca única "brand". Sempre devolve um array.
export function brandsOf(
  track: Pick<Track, "brand" | "brands">
): string[] {
  if (track.brands && track.brands.length > 0) return track.brands;
  return track.brand ? [track.brand] : [];
}
