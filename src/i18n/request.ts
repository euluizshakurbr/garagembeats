import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const LOCALES = ["pt", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const stored = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = LOCALES.includes(stored as Locale)
    ? (stored as Locale)
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
