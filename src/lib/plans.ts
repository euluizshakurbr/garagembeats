export interface Plan {
  id: "solo" | "squad" | "ilimitado";
  name: string;
  priceLabel: string;
  priceCents: number;
  priceLabelUsd: string;
  priceCentsUsd: number;
  downloadLimit: number | null; // null = ilimitado
  encomendasIncluidas: number;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "solo",
    name: "Pista",
    priceLabel: "R$19,90",
    priceCents: 1990,
    priceLabelUsd: "US$4.99",
    priceCentsUsd: 499,
    downloadLimit: 3,
    encomendasIncluidas: 0,
  },
  {
    id: "squad",
    name: "Garagem",
    priceLabel: "R$39,90",
    priceCents: 3990,
    priceLabelUsd: "US$9.99",
    priceCentsUsd: 999,
    downloadLimit: 10,
    encomendasIncluidas: 0,
    popular: true,
  },
  {
    id: "ilimitado",
    name: "Pole Position",
    priceLabel: "R$99,99",
    priceCents: 9999,
    priceLabelUsd: "US$24.99",
    priceCentsUsd: 2499,
    downloadLimit: null,
    encomendasIncluidas: 1,
  },
];

export function getPlan(id: string) {
  return PLANS.find((plan) => plan.id === id);
}

// Encomenda (música personalizada) — preço fixo, fora dos planos
export const ENCOMENDA_PRECO = {
  brl: { cents: 2499, label: "R$24,99" },
  usd: { cents: 699, label: "US$6.99" },
};

export function getPlanPreco(plan: Plan, locale: string) {
  return locale === "en"
    ? { cents: plan.priceCentsUsd, label: plan.priceLabelUsd, currency: "usd" as const }
    : { cents: plan.priceCents, label: plan.priceLabel, currency: "brl" as const };
}

export function getEncomendaPreco(locale: string) {
  return locale === "en"
    ? { ...ENCOMENDA_PRECO.usd, currency: "usd" as const }
    : { ...ENCOMENDA_PRECO.brl, currency: "brl" as const };
}
