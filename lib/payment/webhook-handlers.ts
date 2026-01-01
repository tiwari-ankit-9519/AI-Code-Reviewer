"use server";

import { prisma } from "@/lib/prisma";
import {
  SubscriptionTier,
  SubscriptionStatus,
  PaymentProvider,
} from "@prisma/client";
import {
  trackSubscriptionCreated,
  trackSubscriptionUpgraded,
  trackSubscriptionDowngraded,
  trackSubscriptionCancelled,
  trackSubscriptionRenewed,
  trackPaymentSucceeded,
  trackPaymentFailed,
  trackRefundIssued,
  trackTrialConverted,
} from "@/lib/analytics/subscription-events";

export async function handleCheckoutCompleted(session: {
  id: string;
  customer: string;
  subscription: string;
  amount_total: number;
  metadata: {
    userId: string;
    tier: string;
  };
}) {
  try {
    const { userId, tier } = session.metadata;
    const tierEnum = tier as SubscriptionTier;
    const amount = session.amount_total;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionTier: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const wasInTrial = user.subscriptionStatus === SubscriptionStatus.TRIALING;

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tierEnum,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionStartDate: new Date(),
        stripeCustomerId: session.customer,
      },
    });

    await prisma.subscription.create({
      data: {
        userId,
        tier: tierEnum,
        status: SubscriptionStatus.ACTIVE,
        paymentProvider: PaymentProvider.STRIPE,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount,
        currency: "inr",
      },
    });

    if (wasInTrial) {
      await trackTrialConverted(userId, tier, amount);
    }

    await trackSubscriptionCreated(userId, tier, amount, "stripe");

    await trackPaymentSucceeded(userId, amount, "stripe", tier);

    return { success: true };
  } catch (error) {
    console.error("Checkout completed handler error:", error);
    throw error;
  }
}

export async function handleSubscriptionUpdated(subscription: {
  id: string;
  customer: string;
  status: string;
  items: {
    data: Array<{
      price: {
        id: string;
        unit_amount: number;
      };
    }>;
  };
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  metadata: {
    userId?: string;
    tier?: string;
  };
}) {
  try {
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      include: { user: true },
    });

    if (!existingSubscription) {
      throw new Error("Subscription not found");
    }

    const userId = existingSubscription.userId;
    const oldTier = existingSubscription.tier;
    const newTier = (subscription.metadata.tier as SubscriptionTier) || oldTier;
    const amount = subscription.items.data[0]?.price.unit_amount || 0;

    const status = mapStripeStatus(subscription.status);

    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        tier: newTier,
        status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
        amount,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: newTier,
        subscriptionStatus: status,
      },
    });

    if (oldTier !== newTier) {
      const tierOrder = {
        STARTER: 1,
        HERO: 2,
        LEGEND: 3,
      };

      if (tierOrder[newTier] > tierOrder[oldTier]) {
        await trackSubscriptionUpgraded(userId, oldTier, newTier, amount);
      } else {
        await trackSubscriptionDowngraded(userId, oldTier, newTier);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Subscription updated handler error:", error);
    throw error;
  }
}

export async function handleSubscriptionDeleted(subscription: {
  id: string;
  customer: string;
  metadata: {
    userId?: string;
    tier?: string;
  };
}) {
  try {
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSubscription) {
      throw new Error("Subscription not found");
    }

    const userId = existingSubscription.userId;
    const tier = existingSubscription.tier;

    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        canceledAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: SubscriptionTier.STARTER,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
        subscriptionEndDate: new Date(),
      },
    });

    await trackSubscriptionCancelled(userId, tier, "user_cancelled");

    return { success: true };
  } catch (error) {
    console.error("Subscription deleted handler error:", error);
    throw error;
  }
}

export async function handleInvoicePaid(invoice: {
  id: string;
  customer: string;
  subscription: string;
  amount_paid: number;
  billing_reason: string;
}) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription },
      include: { user: true },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const userId = subscription.userId;
    const tier = subscription.tier;
    const amount = invoice.amount_paid;

    if (invoice.billing_reason === "subscription_cycle") {
      await trackSubscriptionRenewed(userId, tier, amount);
    }

    await trackPaymentSucceeded(userId, amount, "stripe", tier);

    return { success: true };
  } catch (error) {
    console.error("Invoice paid handler error:", error);
    throw error;
  }
}

export async function handleInvoicePaymentFailed(invoice: {
  id: string;
  customer: string;
  subscription: string;
  amount_due: number;
  last_payment_error?: {
    message: string;
  };
}) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const userId = subscription.userId;
    const amount = invoice.amount_due;
    const errorMessage =
      invoice.last_payment_error?.message || "Payment failed";

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE,
      },
    });

    await trackPaymentFailed(userId, amount, "stripe", errorMessage);

    return { success: true };
  } catch (error) {
    console.error("Invoice payment failed handler error:", error);
    throw error;
  }
}

export async function handleChargeRefunded(charge: {
  id: string;
  customer: string;
  amount_refunded: number;
  refunds: {
    data: Array<{
      reason: string | null;
    }>;
  };
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: charge.customer },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const amount = charge.amount_refunded;
    const reason = charge.refunds.data[0]?.reason || "refund_requested";

    await trackRefundIssued(user.id, amount, reason);

    return { success: true };
  } catch (error) {
    console.error("Charge refunded handler error:", error);
    throw error;
  }
}

function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    trialing: SubscriptionStatus.TRIALING,
    canceled: SubscriptionStatus.CANCELLED,
    incomplete: SubscriptionStatus.PAST_DUE,
    incomplete_expired: SubscriptionStatus.EXPIRED,
    past_due: SubscriptionStatus.PAST_DUE,
    unpaid: SubscriptionStatus.PAST_DUE,
  };

  return statusMap[stripeStatus] || SubscriptionStatus.ACTIVE;
}
