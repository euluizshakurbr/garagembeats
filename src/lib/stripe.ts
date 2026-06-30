import Stripe from "stripe";

export function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && key !== "sk_test_sua_chave_aqui";
}

export function getStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}
