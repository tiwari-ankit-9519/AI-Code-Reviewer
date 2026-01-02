"use server";

import { prisma } from "@/lib/prisma";

const HERO_PRICE_INR = 299900;
const LEGEND_PRICE_INR = 999900;

export async function calculateMRR(): Promise<number> {
  const [heroCount, legendCount] = await Promise.all([
    prisma.user.count({
      where: {
        subscriptionTier: "HERO",
        subscriptionStatus: "ACTIVE",
      },
    }),
    prisma.user.count({
      where: {
        subscriptionTier: "LEGEND",
        subscriptionStatus: "ACTIVE",
      },
    }),
  ]);

  const totalMRR = heroCount * HERO_PRICE_INR + legendCount * LEGEND_PRICE_INR;

  return totalMRR / 100;
}

function calculateARR(mrr: number): number {
  return mrr * 12;
}

export async function calculateARPU(): Promise<number> {
  const mrr = await calculateMRR();

  const activeUsers = await prisma.user.count({
    where: {
      subscriptionTier: { in: ["HERO", "LEGEND"] },
      subscriptionStatus: "ACTIVE",
    },
  });

  return activeUsers > 0 ? mrr / activeUsers : 0;
}

export async function calculateChurnRate(
  month: number,
  year: number
): Promise<number> {
  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0, 23, 59, 59);

  const startOfMonthActive = await prisma.user.count({
    where: {
      subscriptionTier: { in: ["HERO", "LEGEND"] },
      subscriptionStatus: "ACTIVE",
      createdAt: { lt: periodStart },
    },
  });

  const cancelled = await prisma.subscriptionHistory.count({
    where: {
      action: "SUBSCRIPTION_CANCELLED",
      createdAt: { gte: periodStart, lte: periodEnd },
    },
  });

  return startOfMonthActive > 0 ? (cancelled / startOfMonthActive) * 100 : 0;
}

export async function calculateTrialConversion(
  month: number,
  year: number
): Promise<number> {
  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0, 23, 59, 59);

  const trialsStarted = await prisma.subscriptionHistory.count({
    where: {
      action: "TRIAL_STARTED",
      createdAt: { gte: periodStart, lte: periodEnd },
    },
  });

  const trialsConverted = await prisma.subscriptionHistory.count({
    where: {
      action: "TRIAL_CONVERTED",
      createdAt: { gte: periodStart, lte: periodEnd },
    },
  });

  return trialsStarted > 0 ? (trialsConverted / trialsStarted) * 100 : 0;
}

export async function calculateLTV(): Promise<number> {
  const arpu = await calculateARPU();

  const now = new Date();
  const churnRate = await calculateChurnRate(
    now.getMonth() + 1,
    now.getFullYear()
  );

  return churnRate > 0 ? arpu / (churnRate / 100) : 0;
}

export async function calculateRevenueGrowth(): Promise<number> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const currentMRR = await calculateMRR();

  const lastMonthEnd = new Date(lastMonthYear, lastMonth, 0, 23, 59, 59);

  const lastMonthHeroCount = await prisma.user.count({
    where: {
      subscriptionTier: "HERO",
      subscriptionStatus: "ACTIVE",
      createdAt: { lte: lastMonthEnd },
    },
  });

  const lastMonthLegendCount = await prisma.user.count({
    where: {
      subscriptionTier: "LEGEND",
      subscriptionStatus: "ACTIVE",
      createdAt: { lte: lastMonthEnd },
    },
  });

  const lastMonthMRR =
    (lastMonthHeroCount * HERO_PRICE_INR +
      lastMonthLegendCount * LEGEND_PRICE_INR) /
    100;

  return lastMonthMRR > 0
    ? ((currentMRR - lastMonthMRR) / lastMonthMRR) * 100
    : 0;
}

export async function calculateUserGrowth(): Promise<number> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const currentTotal = await prisma.user.count();

  const lastMonthEnd = new Date(lastMonthYear, lastMonth, 0, 23, 59, 59);
  const lastMonthTotal = await prisma.user.count({
    where: {
      createdAt: { lte: lastMonthEnd },
    },
  });

  return lastMonthTotal > 0
    ? ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100
    : 0;
}

export async function getMetricsSummary() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [
    mrr,
    arpu,
    ltv,
    churnRate,
    trialConversion,
    revenueGrowth,
    userGrowth,
  ] = await Promise.all([
    calculateMRR(),
    calculateARPU(),
    calculateLTV(),
    calculateChurnRate(currentMonth, currentYear),
    calculateTrialConversion(currentMonth, currentYear),
    calculateRevenueGrowth(),
    calculateUserGrowth(),
  ]);

  const arr = calculateARR(mrr);

  return {
    mrr: Math.round(mrr),
    arr: Math.round(arr),
    arpu: Math.round(arpu),
    ltv: Math.round(ltv),
    churnRate: Math.round(churnRate * 10) / 10,
    trialConversion: Math.round(trialConversion * 10) / 10,
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    userGrowth: Math.round(userGrowth * 10) / 10,
  };
}

export async function getActiveSubscriptionsByTier() {
  const [starter, hero, legend] = await Promise.all([
    prisma.user.count({
      where: {
        subscriptionTier: "STARTER",
        subscriptionStatus: "ACTIVE",
      },
    }),
    prisma.user.count({
      where: {
        subscriptionTier: "HERO",
        subscriptionStatus: "ACTIVE",
      },
    }),
    prisma.user.count({
      where: {
        subscriptionTier: "LEGEND",
        subscriptionStatus: "ACTIVE",
      },
    }),
  ]);

  return { starter, hero, legend };
}

export async function getTrialMetrics(month: number, year: number) {
  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0, 23, 59, 59);

  const [started, converted, expired] = await Promise.all([
    prisma.subscriptionHistory.count({
      where: {
        action: "TRIAL_STARTED",
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.subscriptionHistory.count({
      where: {
        action: "TRIAL_CONVERTED",
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    prisma.subscriptionHistory.count({
      where: {
        action: "TRIAL_EXPIRED",
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    }),
  ]);

  const conversionRate = started > 0 ? (converted / started) * 100 : 0;

  return {
    started,
    converted,
    expired,
    conversionRate: Math.round(conversionRate * 10) / 10,
  };
}

export async function getSubmissionMetrics(month: number, year: number) {
  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0, 23, 59, 59);

  const submissions = await prisma.codeSubmission.findMany({
    where: {
      createdAt: { gte: periodStart, lte: periodEnd },
    },
    include: {
      user: {
        select: { subscriptionTier: true },
      },
    },
  });

  const byTier = {
    starter: submissions.filter((s) => s.user.subscriptionTier === "STARTER")
      .length,
    hero: submissions.filter((s) => s.user.subscriptionTier === "HERO").length,
    legend: submissions.filter((s) => s.user.subscriptionTier === "LEGEND")
      .length,
  };

  const totalUsers = await prisma.user.count({
    where: {
      createdAt: { lte: periodEnd },
    },
  });

  const avgPerUser = totalUsers > 0 ? submissions.length / totalUsers : 0;

  return {
    total: submissions.length,
    byTier,
    avgPerUser: Math.round(avgPerUser * 10) / 10,
  };
}
