import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

interface TierConfig {
  reviewsPerSession: number;
  coolingPeriodHours: number;
  monthlyReviewLimit: number | null;
}

export const DEFAULT_TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  STARTER: {
    reviewsPerSession: 5,
    coolingPeriodHours: 0,
    monthlyReviewLimit: 5,
  },
  HERO: {
    reviewsPerSession: 20,
    coolingPeriodHours: 24,
    monthlyReviewLimit: null,
  },
  LEGEND: {
    reviewsPerSession: 50,
    coolingPeriodHours: 0,
    monthlyReviewLimit: null,
  },
};

export async function getTierLimitConfig(
  tier: SubscriptionTier
): Promise<TierConfig> {
  let config = await prisma.tierLimitConfig.findUnique({
    where: { tier },
  });

  if (!config) {
    config = await prisma.tierLimitConfig.create({
      data: {
        tier,
        ...DEFAULT_TIER_CONFIGS[tier],
      },
    });
  }

  if (config && config.isActive) {
    return {
      reviewsPerSession: config.reviewsPerSession,
      coolingPeriodHours: config.coolingPeriodHours,
      monthlyReviewLimit: config.monthlyReviewLimit,
    };
  }

  return DEFAULT_TIER_CONFIGS[tier];
}

export async function updateTierLimitConfig(
  tier: SubscriptionTier,
  config: Partial<TierConfig>,
  adminId: string
): Promise<void> {
  if (tier === "STARTER") {
    throw new Error("STARTER tier configuration cannot be modified");
  }

  const validatedConfig = validateTierConfig(config);

  const existingConfig = await prisma.tierLimitConfig.findUnique({
    where: { tier },
  });

  if (existingConfig) {
    await prisma.tierLimitConfig.update({
      where: { tier },
      data: {
        ...validatedConfig,
        modifiedBy: adminId,
      },
    });
  } else {
    await prisma.tierLimitConfig.create({
      data: {
        tier,
        ...validatedConfig,
        modifiedBy: adminId,
      },
    });
  }

  await prisma.subscriptionHistory.create({
    data: {
      userId: adminId,
      action: "TIER_CONFIG_UPDATED",
      toTier: tier,
      metadata: {
        config: validatedConfig,
        updatedBy: adminId,
        timestamp: new Date().toISOString(),
      },
    },
  });
}

export async function getTierConfigHistory(tier: SubscriptionTier) {
  return await prisma.subscriptionHistory.findMany({
    where: {
      action: "TIER_CONFIG_UPDATED",
      toTier: tier,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}

function validateTierConfig(config: Partial<TierConfig>): Partial<TierConfig> {
  const validated: Partial<TierConfig> = {};

  if (config.reviewsPerSession !== undefined) {
    if (config.reviewsPerSession < 1 || config.reviewsPerSession > 1000) {
      throw new Error("Reviews per session must be between 1 and 1000");
    }
    validated.reviewsPerSession = config.reviewsPerSession;
  }

  if (config.coolingPeriodHours !== undefined) {
    if (config.coolingPeriodHours < 0 || config.coolingPeriodHours > 168) {
      throw new Error(
        "Cooling period must be between 0 and 168 hours (7 days)"
      );
    }
    validated.coolingPeriodHours = config.coolingPeriodHours;
  }

  if (config.monthlyReviewLimit !== undefined) {
    if (config.monthlyReviewLimit !== null && config.monthlyReviewLimit < 1) {
      throw new Error(
        "Monthly review limit must be at least 1 or null for unlimited"
      );
    }
    validated.monthlyReviewLimit = config.monthlyReviewLimit;
  }

  return validated;
}

export async function initializeTierConfigs(): Promise<void> {
  for (const [tier, config] of Object.entries(DEFAULT_TIER_CONFIGS)) {
    const existing = await prisma.tierLimitConfig.findUnique({
      where: { tier: tier as SubscriptionTier },
    });

    if (!existing) {
      await prisma.tierLimitConfig.create({
        data: {
          tier: tier as SubscriptionTier,
          ...config,
        },
      });
    }
  }
}
