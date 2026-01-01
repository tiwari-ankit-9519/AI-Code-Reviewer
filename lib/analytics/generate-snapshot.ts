import { prisma } from "@/lib/prisma";
import {
  generateMonthlyAnalytics,
  getRevenueSummary,
  getUserTierDistribution,
  getSubscriptionStatusDistribution,
} from "@/lib/subscription/tier-config";

interface MonthlySnapshot {
  period: string;
  totalUsers: number;
  starterUsers: number;
  heroUsers: number;
  legendUsers: number;
  newUsers: number;
  churnedUsers: number;
  activeUsers: number;
  trialingUsers: number;
  cancelledUsers: number;
  trialsStarted: number;
  trialsConverted: number;
  trialsExpired: number;
  trialConversionRate: number;
  mrr: number;
  arr: number;
  arpu: number;
  totalSubmissions: number;
  submissionsByTier: {
    starter: number;
    hero: number;
    legend: number;
  };
  avgSubmissionsPerUser: number;
  userGrowthRate: number;
  revenueGrowthRate: number;
}

export async function generateMonthlySnapshot(
  year: number,
  month: number
): Promise<MonthlySnapshot> {
  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0, 23, 59, 59);
  const previousMonthStart = new Date(year, month - 2, 1);
  const previousMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);

  const [
    tierDistribution,
    statusDistribution,
    revenueSummary,
    totalUsers,
    previousMonthUsers,
    newUsers,
    submissions,
  ] = await Promise.all([
    getUserTierDistribution(),
    getSubscriptionStatusDistribution(),
    getRevenueSummary(),
    prisma.user.count({
      where: { createdAt: { lte: periodEnd } },
    }),
    prisma.user.count({
      where: { createdAt: { lte: previousMonthEnd } },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.codeSubmission.findMany({
      where: {
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      include: {
        user: {
          select: { subscriptionTier: true },
        },
      },
    }),
  ]);

  const starterUsers =
    tierDistribution.find((t) => t.tier === "STARTER")?.count || 0;
  const heroUsers = tierDistribution.find((t) => t.tier === "HERO")?.count || 0;
  const legendUsers =
    tierDistribution.find((t) => t.tier === "LEGEND")?.count || 0;

  const activeUsers =
    statusDistribution.find((s) => s.status === "ACTIVE")?.count || 0;
  const trialingUsers =
    statusDistribution.find((s) => s.status === "TRIALING")?.count || 0;
  const cancelledUsers =
    statusDistribution.find((s) => s.status === "CANCELLED")?.count || 0;

  const trialsStarted = await prisma.subscriptionHistory.count({
    where: {
      action: "TRIAL_STARTED",
      createdAt: { gte: periodStart, lte: periodEnd },
    },
  });

  const trialsConverted = await prisma.subscriptionHistory.count({
    where: {
      action: "SUBSCRIPTION_CREATED",
      fromTier: "STARTER",
      createdAt: { gte: periodStart, lte: periodEnd },
    },
  });

  const trialsExpired = await prisma.subscriptionHistory.count({
    where: {
      action: "TRIAL_EXPIRED",
      createdAt: { gte: periodStart, lte: periodEnd },
    },
  });

  const churnedUsers = await prisma.subscriptionHistory.count({
    where: {
      action: "SUBSCRIPTION_CANCELLED",
      createdAt: { gte: periodStart, lte: periodEnd },
    },
  });

  const trialConversionRate =
    trialsStarted > 0 ? (trialsConverted / trialsStarted) * 100 : 0;

  const submissionsByTier = {
    starter: submissions.filter((s) => s.user.subscriptionTier === "STARTER")
      .length,
    hero: submissions.filter((s) => s.user.subscriptionTier === "HERO").length,
    legend: submissions.filter((s) => s.user.subscriptionTier === "LEGEND")
      .length,
  };

  const avgSubmissionsPerUser =
    totalUsers > 0 ? submissions.length / totalUsers : 0;

  const userGrowthRate =
    previousMonthUsers > 0
      ? ((totalUsers - previousMonthUsers) / previousMonthUsers) * 100
      : 0;

  const previousMonthRevenue = await calculatePreviousMonthMRR(
    previousMonthStart,
    previousMonthEnd
  );

  const revenueGrowthRate =
    previousMonthRevenue > 0
      ? ((revenueSummary.mrr - previousMonthRevenue) / previousMonthRevenue) *
        100
      : 0;

  const arpu =
    heroUsers + legendUsers > 0
      ? revenueSummary.mrr / (heroUsers + legendUsers)
      : 0;

  await generateMonthlyAnalytics();

  const snapshot: MonthlySnapshot = {
    period: `${year}-${String(month).padStart(2, "0")}`,
    totalUsers,
    starterUsers,
    heroUsers,
    legendUsers,
    newUsers,
    churnedUsers,
    activeUsers,
    trialingUsers,
    cancelledUsers,
    trialsStarted,
    trialsConverted,
    trialsExpired,
    trialConversionRate,
    mrr: revenueSummary.mrr,
    arr: revenueSummary.arr,
    arpu,
    totalSubmissions: submissions.length,
    submissionsByTier,
    avgSubmissionsPerUser,
    userGrowthRate,
    revenueGrowthRate,
  };

  return snapshot;
}

async function calculatePreviousMonthMRR(
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  const activeSubscriptions = await prisma.subscription.count({
    where: {
      tier: "HERO",
      status: "ACTIVE",
      currentPeriodEnd: { gte: periodEnd },
      createdAt: { lte: periodEnd },
    },
  });

  return activeSubscriptions * 2900;
}

export async function getRecentSnapshots(limit: number = 12) {
  const snapshots = await prisma.tierUsageAnalytics.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return snapshots;
}

export async function compareSnapshots(
  currentPeriod: string,
  previousPeriod: string
) {
  const [current, previous] = await Promise.all([
    prisma.tierUsageAnalytics.findFirst({
      where: {
        periodStart: {
          gte: new Date(currentPeriod + "-01"),
        },
      },
    }),
    prisma.tierUsageAnalytics.findFirst({
      where: {
        periodStart: {
          gte: new Date(previousPeriod + "-01"),
        },
      },
    }),
  ]);

  if (!current || !previous) {
    return null;
  }

  return {
    userGrowth: current.totalUsers - previous.totalUsers,
    userGrowthRate:
      previous.totalUsers > 0
        ? ((current.totalUsers - previous.totalUsers) / previous.totalUsers) *
          100
        : 0,
    submissionGrowth: current.totalSubmissions - previous.totalSubmissions,
    mrrGrowth: (current.mrr || 0) - (previous.mrr || 0),
    conversionRateChange:
      (current.conversionRate || 0) - (previous.conversionRate || 0),
    churnRateChange: (current.churnRate || 0) - (previous.churnRate || 0),
  };
}
