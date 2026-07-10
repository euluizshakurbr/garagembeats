// Gera um "slug" a partir do título: minúsculo, sem acentos, com hifens.
// Ex: "Volkswagen Passat TS 2026" -> "volkswagen-passat-ts-2026".
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
