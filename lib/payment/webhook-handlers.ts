import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";
import type Stripe from "stripe";
import type { Prisma } from "@prisma/client";

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as SubscriptionTier;

  if (!userId || !tier) {
    console.error("Missing userId or tier in checkout session metadata");
    return;
  }

  const stripeSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: session.subscription as string },
  });

  if (stripeSubscription) {
    console.log("Subscription already exists, skipping");
    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || "";

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: "ACTIVE",
        subscriptionStartDate: new Date(),
        monthlySubmissionCount: 0,
        submissionLimitNotified: false,
        trialEndsAt: null,
      },
    }),

    prisma.subscription.create({
      data: {
        userId,
        tier,
        status: "ACTIVE",
        paymentProvider: "STRIPE",
        stripeCustomerId: customerId,
        stripeSubscriptionId: session.subscription as string,
        stripePriceId: session.line_items?.data[0]?.price?.id || null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: session.amount_total || 2900,
        currency: session.currency || "usd",
      },
    }),

    prisma.subscriptionHistory.create({
      data: {
        userId,
        action: "UPGRADED",
        toTier: tier,
        amount: session.amount_total,
        metadata: {
          sessionId: session.id,
          customerId: customerId,
        } as Prisma.JsonObject,
      },
    }),
  ]);

  console.log(`Checkout completed for user ${userId}, tier: ${tier}`);
}

export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    return;
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (existingSubscription) {
    console.log("Subscription already exists");
    return;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id || "";

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "ACTIVE",
        subscriptionStartDate: new Date(
          subscription.current_period_start * 1000
        ),
      },
    }),

    prisma.subscription.create({
      data: {
        userId,
        tier: "HERO",
        status: "ACTIVE",
        paymentProvider: "STRIPE",
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id || null,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        amount: subscription.items.data[0]?.price.unit_amount || 2900,
        currency: subscription.currency,
      },
    }),
  ]);

  console.log(`Subscription created for user ${userId}`);
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!sub) {
    console.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  const newStatus = subscription.status === "active" ? "ACTIVE" : "PAST_DUE";
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: newStatus,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd,
      },
    }),

    prisma.user.update({
      where: { id: sub.userId },
      data: {
        subscriptionStatus: newStatus,
      },
    }),
  ]);

  if (cancelAtPeriodEnd) {
    await prisma.subscriptionHistory.create({
      data: {
        userId: sub.userId,
        action: "CANCELLED",
        fromTier: sub.tier,
        toTier: sub.tier,
        reason: "scheduled_cancellation",
      },
    });
  }

  console.log(`Subscription updated: ${subscription.id}, status: ${newStatus}`);
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!sub) {
    console.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: sub.userId },
      data: {
        subscriptionTier: "STARTER",
        subscriptionStatus: "EXPIRED",
        subscriptionEndDate: new Date(),
        monthlySubmissionCount: 0,
        submissionLimitNotified: false,
      },
    }),

    prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "EXPIRED",
        canceledAt: new Date(),
      },
    }),

    prisma.subscriptionHistory.create({
      data: {
        userId: sub.userId,
        action: "CANCELLED",
        fromTier: sub.tier,
        toTier: "STARTER",
        reason: "subscription_cancelled",
      },
    }),
  ]);

  console.log(`Subscription deleted for user ${sub.userId}`);
}

export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subscriptionId) {
    console.log("No subscription ID in invoice");
    return;
  }

  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!sub) {
    console.error(`Subscription not found for invoice: ${invoice.id}`);
    return;
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "ACTIVE",
        currentPeriodStart: new Date(
          (invoice.lines.data[0]?.period?.start || 0) * 1000
        ),
        currentPeriodEnd: new Date(
          (invoice.lines.data[0]?.period?.end || 0) * 1000
        ),
      },
    }),

    prisma.user.update({
      where: { id: sub.userId },
      data: {
        subscriptionStatus: "ACTIVE",
      },
    }),

    prisma.subscriptionHistory.create({
      data: {
        userId: sub.userId,
        action: "RENEWED",
        toTier: sub.tier,
        amount: invoice.amount_paid,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number || "",
        } as Prisma.JsonObject,
      },
    }),
  ]);

  console.log(
    `Payment succeeded for user ${sub.userId}, invoice: ${invoice.id}`
  );
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subscriptionId) {
    console.log("No subscription ID in invoice");
    return;
  }

  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!sub) {
    console.error(`Subscription not found for invoice: ${invoice.id}`);
    return;
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "PAST_DUE",
      },
    }),

    prisma.user.update({
      where: { id: sub.userId },
      data: {
        subscriptionStatus: "PAST_DUE",
      },
    }),

    prisma.subscriptionHistory.create({
      data: {
        userId: sub.userId,
        action: "PAYMENT_FAILED",
        toTier: sub.tier,
        amount: invoice.amount_due,
        reason: "payment_failed",
        metadata: {
          invoiceId: invoice.id,
          attemptCount: invoice.attempt_count || 0,
        } as Prisma.JsonObject,
      },
    }),
  ]);

  console.log(`Payment failed for user ${sub.userId}, invoice: ${invoice.id}`);
}
