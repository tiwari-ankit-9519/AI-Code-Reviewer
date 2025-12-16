"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/payment/stripe-client";

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

  if (!portalSession.url) {
    throw new Error("Failed to create portal session");
  }

  return { url: portalSession.url };
}

export async function cancelSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: "ACTIVE",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription?.stripeSubscriptionId) {
    throw new Error("No active subscription found");
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: true,
    },
  });

  return { success: true };
}

export async function reactivateSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      cancelAtPeriodEnd: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription?.stripeSubscriptionId) {
    throw new Error("No subscription to reactivate");
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: false,
    },
  });

  return { success: true };
}

export async function getSubscriptionDetails() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription) {
    return null;
  }

  return {
    tier: subscription.tier,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    amount: subscription.amount,
    currency: subscription.currency,
  };
}
