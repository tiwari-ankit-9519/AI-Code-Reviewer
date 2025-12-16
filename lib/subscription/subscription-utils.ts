import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export interface SubmissionCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount: number;
  limit: number | string;
  isInTrial: boolean;
  tier: SubscriptionTier;
}

export interface TrialStatusResult {
  isInTrial: boolean;
  daysRemaining: number;
  trialEndsAt: Date | null;
}

export interface SubmissionThreshold {
  shouldNotify: boolean;
  percentage: number;
  remaining: number;
}

export async function getUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      trialEndsAt: true,
      isTrialUsed: true,
      monthlySubmissionCount: true,
      lastSubmissionReset: true,
      submissionLimitNotified: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function isUserOnTier(
  userId: string,
  tier: SubscriptionTier
): Promise<boolean> {
  const user = await getUserSubscription(userId);
  return user.subscriptionTier === tier;
}

export async function canUserSubmit(
  userId: string
): Promise<SubmissionCheckResult> {
  const user = await getUserSubscription(userId);

  await checkAndResetIfNeeded(userId);

  const limits = getTierLimits(user.subscriptionTier);
  const isInTrial = user.subscriptionStatus === "TRIALING";

  if (limits.monthlySubmissions === -1) {
    return {
      allowed: true,
      currentCount: user.monthlySubmissionCount,
      limit: "unlimited",
      isInTrial,
      tier: user.subscriptionTier,
    };
  }

  const isAllowed = user.monthlySubmissionCount < limits.monthlySubmissions;

  if (!isAllowed) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${limits.monthlySubmissions} submissions. Upgrade to Hero for unlimited submissions!`,
      currentCount: user.monthlySubmissionCount,
      limit: limits.monthlySubmissions,
      isInTrial,
      tier: user.subscriptionTier,
    };
  }

  return {
    allowed: true,
    currentCount: user.monthlySubmissionCount,
    limit: limits.monthlySubmissions,
    isInTrial,
    tier: user.subscriptionTier,
  };
}

export function getTierLimits(tier: SubscriptionTier) {
  const tierConfigs = {
    STARTER: {
      monthlySubmissions: 5,
      maxFileSize: 100000,
      features: [
        "basic_security",
        "performance",
        "quality",
        "community_support",
      ],
      price: 0,
      stripePriceId: null,
    },
    HERO: {
      monthlySubmissions: -1,
      maxFileSize: 100000,
      features: [
        "advanced_security",
        "performance",
        "quality",
        "priority_support",
        "api_access",
        "unlimited_submissions",
      ],
      price: 2900,
      stripePriceId: process.env.STRIPE_HERO_PRICE_ID || null,
    },
    LEGEND: {
      monthlySubmissions: -1,
      maxFileSize: -1,
      features: [
        "all_hero_features",
        "team_features",
        "custom_integrations",
        "sla_guarantee",
        "dedicated_support",
        "unlimited_file_size",
      ],
      price: null,
      stripePriceId: null,
    },
  };

  return tierConfigs[tier];
}

export async function startTrial(userId: string) {
  const user = await getUserSubscription(userId);

  if (user.isTrialUsed) {
    throw new Error("Trial has already been used");
  }

  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: "HERO",
      subscriptionStatus: "TRIALING",
      trialEndsAt,
      subscriptionStartDate: new Date(),
    },
  });

  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "TRIAL_STARTED",
      toTier: "HERO",
      metadata: {
        trialEndsAt: trialEndsAt.toISOString(),
      },
    },
  });

  return { trialEndsAt };
}

export async function checkTrialStatus(
  userId: string
): Promise<TrialStatusResult> {
  const user = await getUserSubscription(userId);

  if (user.subscriptionStatus !== "TRIALING" || !user.trialEndsAt) {
    return {
      isInTrial: false,
      daysRemaining: 0,
      trialEndsAt: null,
    };
  }

  const now = new Date();
  const trialEnd = new Date(user.trialEndsAt);
  const millisecondsRemaining = trialEnd.getTime() - now.getTime();
  const daysRemaining = Math.ceil(
    millisecondsRemaining / (1000 * 60 * 60 * 24)
  );

  return {
    isInTrial: true,
    daysRemaining: Math.max(0, daysRemaining),
    trialEndsAt: user.trialEndsAt,
  };
}

export async function endTrial(userId: string) {
  const user = await getUserSubscription(userId);

  if (user.subscriptionStatus !== "TRIALING") {
    throw new Error("User is not in trial");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: "STARTER",
      subscriptionStatus: "ACTIVE",
      trialEndsAt: null,
      isTrialUsed: true,
      subscriptionEndDate: new Date(),
      monthlySubmissionCount: 0,
      submissionLimitNotified: false,
    },
  });

  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "TRIAL_ENDED",
      fromTier: "HERO",
      toTier: "STARTER",
      reason: "trial_expired",
    },
  });
}

export async function incrementSubmissionCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlySubmissionCount: {
        increment: 1,
      },
    },
  });
}

export async function resetMonthlySubmissions(userId?: string) {
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlySubmissionCount: 0,
        lastSubmissionReset: new Date(),
        submissionLimitNotified: false,
      },
    });
  } else {
    await prisma.user.updateMany({
      data: {
        monthlySubmissionCount: 0,
        lastSubmissionReset: new Date(),
        submissionLimitNotified: false,
      },
    });
  }
}

export async function checkAndResetIfNeeded(userId: string) {
  const user = await getUserSubscription(userId);

  const now = new Date();
  const lastReset = new Date(user.lastSubmissionReset);

  const isNewMonth =
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear();

  if (isNewMonth) {
    await resetMonthlySubmissions(userId);
  }
}

export async function checkSubmissionThreshold(
  userId: string
): Promise<SubmissionThreshold> {
  const user = await getUserSubscription(userId);
  const limits = getTierLimits(user.subscriptionTier);

  if (limits.monthlySubmissions === -1) {
    return {
      shouldNotify: false,
      percentage: 0,
      remaining: -1,
    };
  }

  const percentage =
    (user.monthlySubmissionCount / limits.monthlySubmissions) * 100;
  const remaining = limits.monthlySubmissions - user.monthlySubmissionCount;

  const shouldNotify =
    percentage >= 80 && !user.submissionLimitNotified && remaining > 0;

  return {
    shouldNotify,
    percentage: Math.round(percentage),
    remaining,
  };
}

export async function upgradeTier(
  userId: string,
  newTier: SubscriptionTier,
  metadata?: Prisma.JsonObject
) {
  const user = await getUserSubscription(userId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: newTier,
        subscriptionStatus: "ACTIVE",
        subscriptionStartDate: new Date(),
        monthlySubmissionCount: 0,
        submissionLimitNotified: false,
        trialEndsAt: null,
      },
    }),

    prisma.subscriptionHistory.create({
      data: {
        userId,
        action: "UPGRADED",
        fromTier: user.subscriptionTier,
        toTier: newTier,
        metadata: metadata || {},
      },
    }),
  ]);
}

export async function downgradeTier(
  userId: string,
  newTier: SubscriptionTier,
  reason?: string
) {
  const user = await getUserSubscription(userId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: newTier,
        subscriptionStatus: "ACTIVE",
        subscriptionEndDate: new Date(),
        monthlySubmissionCount: 0,
        submissionLimitNotified: false,
      },
    }),

    prisma.subscriptionHistory.create({
      data: {
        userId,
        action: "DOWNGRADED",
        fromTier: user.subscriptionTier,
        toTier: newTier,
        reason: reason || "user_requested",
      },
    }),
  ]);
}

export async function cancelSubscription(userId: string, reason?: string) {
  const user = await getUserSubscription(userId);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "CANCELLED",
        subscriptionEndDate: new Date(),
      },
    }),

    prisma.subscriptionHistory.create({
      data: {
        userId,
        action: "CANCELLED",
        fromTier: user.subscriptionTier,
        toTier: user.subscriptionTier,
        reason: reason || "user_cancelled",
      },
    }),
  ]);
}
