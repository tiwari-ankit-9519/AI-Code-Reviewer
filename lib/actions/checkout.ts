"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, STRIPE_CONFIG } from "@/lib/payment/stripe-client";
import { TIER_CONFIG } from "@/lib/subscription/tier-config";

export async function createCheckoutSession(tier: "HERO") {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      stripeCustomerId: true,
      subscriptionTier: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (
    user.subscriptionTier === "HERO" &&
    user.subscriptionStatus === "ACTIVE"
  ) {
    throw new Error("You already have an active Hero subscription");
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id,
      },
    });

    customerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: TIER_CONFIG.HERO.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: STRIPE_CONFIG.cancelUrl,
    metadata: {
      userId: user.id,
      tier: tier,
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    customer_update: {
      address: "auto",
      name: "auto",
    },
  });

  if (!checkoutSession.url) {
    throw new Error("Failed to create checkout session");
  }

  return { url: checkoutSession.url };
}

export async function createPortalSession() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      stripeCustomerId: true,
    },
  });

  if (!user?.stripeCustomerId) {
    throw new Error("No subscription found");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
  });

  return { url: portalSession.url };
}
