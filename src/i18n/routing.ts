import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  localePrefix: "always",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/catalogo": { pt: "/catalogo", en: "/catalog" },
    "/sobre": { pt: "/sobre", en: "/about" },
    "/musica/[id]": { pt: "/musica/[id]", en: "/song/[id]" },
    "/planos": { pt: "/planos", en: "/plans" },
    "/encomenda": { pt: "/encomenda", en: "/custom-music" },
    "/conta": { pt: "/conta", en: "/account" },
    "/login": "/login",
    "/cadastro": { pt: "/cadastro", en: "/signup" },
    "/esqueci-senha": { pt: "/esqueci-senha", en: "/forgot-password" },
    "/redefinir-senha": { pt: "/redefinir-senha", en: "/reset-password" },
    "/admin": "/admin",
    "/admin/painel": "/admin/painel",
    "/admin/depoimentos": "/admin/depoimentos",
    "/admin/pedidos": { pt: "/admin/pedidos", en: "/admin/orders" },
    "/termos": { pt: "/termos", en: "/terms" },
    "/privacidade": { pt: "/privacidade", en: "/privacy" },
  },
});

export type AppPathnames = keyof typeof routing.pathnames;
