import { prisma } from "@/lib/prisma";
import { SubscriptionTier, SubscriptionStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type Stripe from "stripe";

type ExpandedInvoice = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};

async function retry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    return retry(fn, retries - 1);
  }
}

async function atomic<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(async (tx) => fn(tx), {
    isolationLevel: "Serializable",
  });
}

async function findSubscription(id: string, tx: Prisma.TransactionClient) {
  return tx.subscription.findFirst({
    where: { stripeSubscriptionId: id },
  });
}

async function updateUserStatus(
  tx: Prisma.TransactionClient,
  userId: string,
  status: SubscriptionStatus
) {
  return tx.user.update({
    where: { id: userId },
    data: { subscriptionStatus: status },
  });
}

async function createHistory(
  tx: Prisma.TransactionClient,
  userId: string,
  data: Omit<Prisma.SubscriptionHistoryCreateInput, "user">
) {
  return tx.subscriptionHistory.create({
    data: {
      user: { connect: { id: userId } },
      ...data,
    },
  });
}

export async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  await retry(async () => {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier as SubscriptionTier;
    if (!userId || !tier) return;

    await atomic(async (tx) => {
      const exists = await findSubscription(session.subscription as string, tx);
      if (exists) return;

      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id || "";

      await tx.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          subscriptionStartDate: new Date(),
          monthlySubmissionCount: 0,
          submissionLimitNotified: false,
          trialEndsAt: null,
        },
      });

      await tx.subscription.create({
        data: {
          userId,
          tier,
          status: SubscriptionStatus.ACTIVE,
          paymentProvider: "STRIPE",
          stripeCustomerId: customerId,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: session.line_items?.data[0]?.price?.id || null,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          amount: session.amount_total || 2900,
          currency: session.currency || "usd",
        },
      });

      await createHistory(tx, userId, {
        action: "UPGRADED",
        toTier: tier,
        amount: session.amount_total || 0,
        metadata: {
          sessionId: session.id,
          customerId,
        } as Prisma.JsonObject,
      });
    });
  });
}

export async function onSubscriptionCreated(sub: Stripe.Subscription) {
  await retry(async () => {
    const userId = sub.metadata?.userId;
    if (!userId) return;

    await atomic(async (tx) => {
      const exists = await findSubscription(sub.id, tx);
      if (exists) return;

      const customerId =
        typeof sub.customer === "string"
          ? sub.customer
          : sub.customer?.id || "";

      await updateUserStatus(tx, userId, SubscriptionStatus.ACTIVE);

      await tx.subscription.create({
        data: {
          userId,
          tier: "HERO",
          status: SubscriptionStatus.ACTIVE,
          paymentProvider: "STRIPE",
          stripeCustomerId: customerId,
          stripeSubscriptionId: sub.id,
          stripePriceId: sub.items.data[0]?.price?.id || null,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          amount: sub.items.data[0]?.price?.unit_amount || 2900,
          currency: sub.currency || "usd",
        },
      });
    });
  });
}

export async function onSubscriptionUpdated(sub: Stripe.Subscription) {
  await retry(async () => {
    await atomic(async (tx) => {
      const found = await findSubscription(sub.id, tx);
      if (!found) return;

      const newStatus =
        sub.status === "active"
          ? SubscriptionStatus.ACTIVE
          : SubscriptionStatus.PAST_DUE;

      const cancelAtPeriodEnd = sub.cancel_at_period_end || false;

      await tx.subscription.update({
        where: { id: found.id },
        data: {
          status: newStatus,
          cancelAtPeriodEnd,
        },
      });

      await updateUserStatus(tx, found.userId, newStatus);

      if (cancelAtPeriodEnd) {
        await createHistory(tx, found.userId, {
          action: "CANCELLED",
          fromTier: found.tier,
          toTier: found.tier,
          reason: "scheduled_cancellation",
        });
      }
    });
  });
}

export async function onSubscriptionDeleted(sub: Stripe.Subscription) {
  await retry(async () => {
    await atomic(async (tx) => {
      const found = await findSubscription(sub.id, tx);
      if (!found) return;

      await tx.user.update({
        where: { id: found.userId },
        data: {
          subscriptionTier: "STARTER",
          subscriptionStatus: SubscriptionStatus.EXPIRED,
          subscriptionEndDate: new Date(),
          monthlySubmissionCount: 0,
          submissionLimitNotified: false,
        },
      });

      await tx.subscription.update({
        where: { id: found.id },
        data: {
          status: SubscriptionStatus.EXPIRED,
          canceledAt: new Date(),
        },
      });

      await createHistory(tx, found.userId, {
        action: "CANCELLED",
        fromTier: found.tier,
        toTier: "STARTER",
        reason: "subscription_cancelled",
      });
    });
  });
}

export async function onPaymentSucceeded(invoice: ExpandedInvoice) {
  await retry(async () => {
    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;

    if (!subscriptionId) return;

    await atomic(async (tx) => {
      const found = await findSubscription(subscriptionId, tx);
      if (!found) return;

      const line = invoice.lines.data[0];
      const start = line?.period?.start || Math.floor(Date.now() / 1000);
      const end = line?.period?.end || start + 30 * 24 * 60 * 60;

      await tx.subscription.update({
        where: { id: found.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(start * 1000),
          currentPeriodEnd: new Date(end * 1000),
        },
      });

      await updateUserStatus(tx, found.userId, SubscriptionStatus.ACTIVE);

      await createHistory(tx, found.userId, {
        action: "RENEWED",
        toTier: found.tier,
        amount: invoice.amount_paid,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
        } as Prisma.JsonObject,
      });
    });
  });
}

export async function onPaymentFailed(invoice: ExpandedInvoice) {
  await retry(async () => {
    const subscriptionId =
      typeof invoice.subscription === "string"
        ? invoice.subscription
        : invoice.subscription?.id;

    if (!subscriptionId) return;

    await atomic(async (tx) => {
      const found = await findSubscription(subscriptionId, tx);
      if (!found) return;

      await tx.subscription.update({
        where: { id: found.id },
        data: {
          status: SubscriptionStatus.PAST_DUE,
        },
      });

      await updateUserStatus(tx, found.userId, SubscriptionStatus.PAST_DUE);

      await createHistory(tx, found.userId, {
        action: "PAYMENT_FAILED",
        toTier: found.tier,
        amount: invoice.amount_due,
        reason: "payment_failed",
        metadata: {
          invoiceId: invoice.id,
          attemptCount: invoice.attempt_count || 0,
        } as Prisma.JsonObject,
      });
    });
  });
}
