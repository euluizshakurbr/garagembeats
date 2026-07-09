import Stripe from "stripe";

export function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && key !== "sk_test_sua_chave_aqui";
}

export function getStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

// Métodos de pagamento do checkout.
// O PIX só é liberado pelo Stripe após ~60 dias de processamento na conta.
// Quando o Stripe habilitar o PIX, basta pôr STRIPE_ENABLE_PIX=true no
// ambiente — nenhuma mudança de código é necessária.
export function getPaymentMethodTypes(
  currency: string
): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  const pixEnabled = process.env.STRIPE_ENABLE_PIX === "true";
  if (pixEnabled && currency === "brl") {
    return ["card", "pix"];
  }
  return ["card"];
}

