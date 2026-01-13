"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SubscriptionTier } from "@prisma/client";

interface TierConfig {
  reviewsPerSession: number;
  coolingPeriodHours: number;
  monthlyReviewLimit: number | null;
}

export async function getTierConfigs() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const configs = await prisma.tierLimitConfig.findMany({
    orderBy: { tier: "asc" },
  });

  return {
    STARTER: configs.find((c) => c.tier === "STARTER") || null,
    HERO: configs.find((c) => c.tier === "HERO") || null,
    LEGEND: configs.find((c) => c.tier === "LEGEND") || null,
  };
}

export async function getConfigHistory() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const history = await prisma.subscriptionHistory.findMany({
    where: {
      action: "TIER_CONFIG_UPDATED",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return history;
}

export async function updateTierConfig(
  tier: SubscriptionTier,
  config: Partial<TierConfig>,
  adminId: string
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (tier === "STARTER") {
    throw new Error("STARTER tier configuration cannot be modified");
  }

  // Validate config
  if (config.reviewsPerSession !== undefined) {
    if (config.reviewsPerSession < 1 || config.reviewsPerSession > 1000) {
      throw new Error("Reviews per session must be between 1 and 1000");
    }
  }

  if (config.coolingPeriodHours !== undefined) {
    if (config.coolingPeriodHours < 0 || config.coolingPeriodHours > 168) {
      throw new Error("Cooling period must be between 0 and 168 hours");
    }
  }

  if (
    config.monthlyReviewLimit !== undefined &&
    config.monthlyReviewLimit !== null
  ) {
    if (config.monthlyReviewLimit < 1) {
      throw new Error("Monthly review limit must be at least 1 or null");
    }
  }

  const existingConfig = await prisma.tierLimitConfig.findUnique({
    where: { tier },
  });

  if (existingConfig) {
    await prisma.tierLimitConfig.update({
      where: { tier },
      data: {
        ...config,
        modifiedBy: adminId,
      },
    });
  } else {
    await prisma.tierLimitConfig.create({
      data: {
        tier,
        reviewsPerSession: config.reviewsPerSession!,
        coolingPeriodHours: config.coolingPeriodHours!,
        monthlyReviewLimit: config.monthlyReviewLimit,
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
        config,
        updatedBy: adminId,
        timestamp: new Date().toISOString(),
      },
    },
  });

  revalidatePath("/dashboard/admin/tier-config");
}
