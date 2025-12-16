export const TIER_CONFIG = {
  STARTER: {
    name: "Starter",
    monthlySubmissions: 5,
    maxFileSize: 100000,
    features: ["5 reviews/month", "Basic security", "Community support"],
    price: 0,
    priceDisplay: "$0",
    stripePriceId: null,
    description: "Try the basics",
  },
  HERO: {
    name: "Hero",
    monthlySubmissions: -1,
    maxFileSize: 100000,
    features: [
      "Unlimited reviews",
      "Advanced security & performance",
      "Priority support",
      "API access",
      "Up to 100KB file size",
    ],
    price: 2900,
    priceDisplay: "$29",
    stripePriceId: process.env.STRIPE_HERO_PRICE_ID || "",
    description: "For champions",
  },
  LEGEND: {
    name: "Legend",
    monthlySubmissions: -1,
    maxFileSize: -1,
    features: [
      "Everything in Hero",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Unlimited file size",
    ],
    price: null,
    priceDisplay: "Custom",
    stripePriceId: null,
    description: "For elite teams",
  },
} as const;

export const TRIAL_DURATION_DAYS = 7;

export const NOTIFICATION_THRESHOLD = 0.8;

export const SUBMISSION_LIMITS = {
  STARTER: 5,
  HERO: -1,
  LEGEND: -1,
} as const;

export const FILE_SIZE_LIMITS = {
  STARTER: 100000,
  HERO: 100000,
  LEGEND: -1,
} as const;

export const TIER_FEATURES = {
  STARTER: [
    "basic_security",
    "performance_analysis",
    "quality_checks",
    "community_support",
  ],
  HERO: [
    "advanced_security",
    "performance_analysis",
    "quality_checks",
    "priority_support",
    "api_access",
    "unlimited_submissions",
  ],
  LEGEND: [
    "advanced_security",
    "performance_analysis",
    "quality_checks",
    "priority_support",
    "api_access",
    "unlimited_submissions",
    "team_features",
    "custom_integrations",
    "sla_guarantee",
    "dedicated_support",
    "unlimited_file_size",
  ],
} as const;

export const TIER_COLORS = {
  STARTER: {
    bg: "from-gray-800/50 to-gray-900/50",
    border: "border-gray-600",
    text: "text-gray-300",
    shadow: "shadow-gray-500/30",
  },
  HERO: {
    bg: "from-purple-600 to-pink-600",
    border: "border-purple-800",
    text: "text-white",
    shadow: "shadow-purple-500/50",
  },
  LEGEND: {
    bg: "from-yellow-400 to-orange-500",
    border: "border-yellow-600",
    text: "text-gray-900",
    shadow: "shadow-yellow-500/50",
  },
} as const;

import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export async function calculateTierUsageAnalytics(
  tier: SubscriptionTier,
  periodStart: Date,
  periodEnd: Date
) {
  const users = await prisma.user.findMany({
    where: {
      subscriptionTier: tier,
      createdAt: {
        lte: periodEnd,
      },
    },
    select: {
      id: true,
      subscriptionStatus: true,
      createdAt: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      submissions: {
        where: {
          createdAt: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
        select: {
          id: true,
        },
      },
    },
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(
    (u) =>
      u.subscriptionStatus === "ACTIVE" || u.subscriptionStatus === "TRIALING"
  ).length;

  const totalSubmissions = users.reduce(
    (sum, user) => sum + user.submissions.length,
    0
  );

  const avgSubmissionsPerUser =
    totalUsers > 0 ? totalSubmissions / totalUsers : 0;

  let conversionRate: number | null = null;
  if (tier === "HERO" || tier === "LEGEND") {
    const totalStarterUsers = await prisma.user.count({
      where: {
        subscriptionTier: "STARTER",
        createdAt: {
          lte: periodEnd,
        },
      },
    });

    const convertedUsers = users.filter(
      (u) =>
        u.subscriptionStartDate &&
        new Date(u.subscriptionStartDate) >= periodStart &&
        new Date(u.subscriptionStartDate) <= periodEnd
    ).length;

    conversionRate =
      totalStarterUsers > 0 ? convertedUsers / totalStarterUsers : 0;
  }

  let churnRate: number | null = null;
  if (tier === "HERO" || tier === "LEGEND") {
    const churnedUsers = users.filter(
      (u) =>
        u.subscriptionEndDate &&
        new Date(u.subscriptionEndDate) >= periodStart &&
        new Date(u.subscriptionEndDate) <= periodEnd
    ).length;

    churnRate = totalUsers > 0 ? churnedUsers / totalUsers : 0;
  }

  let mrr: number | null = null;
  if (tier === "HERO") {
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        tier: "HERO",
        status: "ACTIVE",
        currentPeriodEnd: {
          gte: periodEnd,
        },
      },
    });

    mrr = activeSubscriptions * 2900;
  }

  return {
    tier,
    totalUsers,
    activeUsers,
    totalSubmissions,
    avgSubmissionsPerUser,
    conversionRate,
    churnRate,
    mrr,
    periodStart,
    periodEnd,
  };
}

export async function saveTierUsageAnalytics(
  tier: SubscriptionTier,
  periodStart: Date,
  periodEnd: Date
) {
  const analytics = await calculateTierUsageAnalytics(
    tier,
    periodStart,
    periodEnd
  );

  return await prisma.tierUsageAnalytics.create({
    data: {
      ...analytics,
    },
  });
}

export async function generateMonthlyAnalytics() {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const tiers: SubscriptionTier[] = ["STARTER", "HERO", "LEGEND"];

  const results = [];

  for (const tier of tiers) {
    const analytics = await saveTierUsageAnalytics(
      tier,
      periodStart,
      periodEnd
    );
    results.push(analytics);
  }

  return results;
}

export async function getTierAnalytics(
  tier: SubscriptionTier,
  limit: number = 12
) {
  return await prisma.tierUsageAnalytics.findMany({
    where: { tier },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAllTierAnalytics(limit: number = 12) {
  return await prisma.tierUsageAnalytics.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getTierComparison(periodStart: Date, periodEnd: Date) {
  const analytics = await prisma.tierUsageAnalytics.findMany({
    where: {
      periodStart: { gte: periodStart },
      periodEnd: { lte: periodEnd },
    },
    orderBy: [{ tier: "asc" }, { periodStart: "desc" }],
  });

  const grouped = analytics.reduce((acc, item) => {
    if (!acc[item.tier]) {
      acc[item.tier] = [];
    }
    acc[item.tier].push(item);
    return acc;
  }, {} as Record<SubscriptionTier, typeof analytics>);

  return grouped;
}

export async function getRevenueSummary() {
  const activeHeroSubscriptions = await prisma.subscription.count({
    where: {
      tier: "HERO",
      status: "ACTIVE",
    },
  });

  const mrr = activeHeroSubscriptions * 2900;
  const arr = mrr * 12;

  const thisMonth = new Date();
  const thisMonthStart = new Date(
    thisMonth.getFullYear(),
    thisMonth.getMonth(),
    1
  );
  const lastMonthStart = new Date(
    thisMonth.getFullYear(),
    thisMonth.getMonth() - 1,
    1
  );
  const lastMonthEnd = new Date(
    thisMonth.getFullYear(),
    thisMonth.getMonth(),
    0
  );

  const newSubscriptionsThisMonth = await prisma.subscription.count({
    where: {
      tier: "HERO",
      createdAt: {
        gte: thisMonthStart,
      },
    },
  });

  const newSubscriptionsLastMonth = await prisma.subscription.count({
    where: {
      tier: "HERO",
      createdAt: {
        gte: lastMonthStart,
        lte: lastMonthEnd,
      },
    },
  });

  const cancelledThisMonth = await prisma.subscription.count({
    where: {
      tier: "HERO",
      status: "CANCELLED",
      canceledAt: {
        gte: thisMonthStart,
      },
    },
  });

  const cancelledLastMonth = await prisma.subscription.count({
    where: {
      tier: "HERO",
      status: "CANCELLED",
      canceledAt: {
        gte: lastMonthStart,
        lte: lastMonthEnd,
      },
    },
  });

  const growthRate =
    newSubscriptionsLastMonth > 0
      ? ((newSubscriptionsThisMonth - newSubscriptionsLastMonth) /
          newSubscriptionsLastMonth) *
        100
      : 0;

  return {
    mrr,
    arr,
    activeSubscriptions: activeHeroSubscriptions,
    newThisMonth: newSubscriptionsThisMonth,
    newLastMonth: newSubscriptionsLastMonth,
    cancelledThisMonth,
    cancelledLastMonth,
    netGrowth: newSubscriptionsThisMonth - cancelledThisMonth,
    growthRate,
  };
}

export async function getUserTierDistribution() {
  const distribution = await prisma.user.groupBy({
    by: ["subscriptionTier"],
    _count: {
      id: true,
    },
  });

  const total = distribution.reduce((sum, item) => sum + item._count.id, 0);

  return distribution.map((item) => ({
    tier: item.subscriptionTier,
    count: item._count.id,
    percentage: total > 0 ? (item._count.id / total) * 100 : 0,
  }));
}

export async function getSubscriptionStatusDistribution() {
  const distribution = await prisma.user.groupBy({
    by: ["subscriptionStatus"],
    _count: {
      id: true,
    },
  });

  const total = distribution.reduce((sum, item) => sum + item._count.id, 0);

  return distribution.map((item) => ({
    status: item.subscriptionStatus,
    count: item._count.id,
    percentage: total > 0 ? (item._count.id / total) * 100 : 0,
  }));
}
