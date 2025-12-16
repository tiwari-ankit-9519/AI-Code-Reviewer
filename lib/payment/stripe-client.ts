import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
  typescript: true,
});

export const STRIPE_CONFIG = {
  heroPrice: process.env.STRIPE_HERO_PRICE_ID || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  currency: "usd",
  successUrl: `${process.env.NEXTAUTH_URL}/dashboard/subscription/success`,
  cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard/subscription/cancelled`,
} as const;

export function validateStripeConfig() {
  const missingVars = [];

  if (!process.env.STRIPE_SECRET_KEY) missingVars.push("STRIPE_SECRET_KEY");
  if (!process.env.STRIPE_HERO_PRICE_ID)
    missingVars.push("STRIPE_HERO_PRICE_ID");
  if (!process.env.STRIPE_WEBHOOK_SECRET)
    missingVars.push("STRIPE_WEBHOOK_SECRET");
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    missingVars.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Stripe environment variables: ${missingVars.join(", ")}`
    );
  }

  return true;
}
