import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  localePrefix: "always",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/catalogo": { pt: "/catalogo", en: "/catalog" },
    "/planos": { pt: "/planos", en: "/plans" },
    "/encomenda": { pt: "/encomenda", en: "/custom-music" },
    "/conta": { pt: "/conta", en: "/account" },
    "/login": "/login",
    "/cadastro": { pt: "/cadastro", en: "/signup" },
    "/admin": "/admin",
    "/admin/pedidos": { pt: "/admin/pedidos", en: "/admin/orders" },
    "/termos": { pt: "/termos", en: "/terms" },
    "/privacidade": { pt: "/privacidade", en: "/privacy" },
  },
});

export type AppPathnames = keyof typeof routing.pathnames;
