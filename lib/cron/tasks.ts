import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/payment/stripe-client";
import { resetAllUsers } from "@/lib/subscription/reset-service";

export async function expireTrials(): Promise<number> {
  const now = new Date();

  const expiredUsers = await prisma.user.findMany({
    where: {
      subscriptionStatus: "TRIALING",
      trialEndsAt: { lte: now },
    },
    select: {
      id: true,
      email: true,
      name: true,
      trialEndsAt: true,
    },
  });

  for (const user of expiredUsers) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionTier: "STARTER",
          subscriptionStatus: "ACTIVE",
          trialEndsAt: null,
          isTrialUsed: true,
          monthlySubmissionCount: 0,
          submissionLimitNotified: false,
        },
      }),
      prisma.subscriptionHistory.create({
        data: {
          userId: user.id,
          action: "TRIAL_EXPIRED",
          fromTier: "HERO",
          toTier: "STARTER",
          reason: "trial_expired",
          metadata: {
            expiredAt: now.toISOString(),
          },
        },
      }),
    ]);

    console.log(`Trial expired for user ${user.email}`);
  }

  return expiredUsers.length;
}

export async function sendTrialReminders(): Promise<number> {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const endingSoon = await prisma.user.findMany({
    where: {
      subscriptionStatus: "TRIALING",
      trialEndsAt: {
        gte: now,
        lte: tomorrow,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      trialEndsAt: true,
    },
  });

  console.log(
    `Found ${endingSoon.length} trials ending in 24 hours - reminders to be sent`
  );

  return endingSoon.length;
}

export async function resetAllMonthlySubmissions(): Promise<number> {
  const result = await resetAllUsers();
  return result.resetCount;
}

export async function syncStripeSubscriptions(): Promise<number> {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      paymentProvider: "STRIPE",
      stripeSubscriptionId: { not: null },
    },
    select: {
      id: true,
      stripeSubscriptionId: true,
      status: true,
    },
  });

  let synced = 0;

  for (const sub of activeSubscriptions) {
    if (!sub.stripeSubscriptionId) continue;

    try {
      const stripeSub = await stripe.subscriptions.retrieve(
        sub.stripeSubscriptionId
      );

      if (stripeSub.status !== "active" && sub.status === "ACTIVE") {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: stripeSub.status.toUpperCase() as
              | "ACTIVE"
              | "CANCELLED"
              | "PAST_DUE"
              | "TRIALING",
          },
        });
        synced++;
      }
    } catch (error) {
      console.error(
        `Failed to sync subscription ${sub.id}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  return synced;
}

export async function isFirstDayOfMonth(): Promise<boolean> {
  const now = new Date();
  return now.getDate() === 1;
}

export async function cleanupOldAnalytics(daysToKeep: number = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.tierUsageAnalytics.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

export async function cleanupOldCronLogs(daysToKeep: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.cronLog.deleteMany({
    where: {
      executedAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}
