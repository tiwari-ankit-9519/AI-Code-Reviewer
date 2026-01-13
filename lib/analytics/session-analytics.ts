// lib/analytics/session-analytics.ts
import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  avgReviewsPerSession: number;
  completionRate: number;
}

interface CoolingPeriodStats {
  totalCoolingPeriods: number;
  avgDurationHours: number;
  activeNow: number;
}

interface TierSessionStats {
  tier: SubscriptionTier;
  sessions: SessionStats;
  coolingPeriods: CoolingPeriodStats;
}

export async function getSessionStatsByTier(
  tier: SubscriptionTier,
  startDate: Date,
  endDate: Date
): Promise<TierSessionStats> {
  const sessions = await prisma.reviewSession.findMany({
    where: {
      tier,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(
    (s) => s.isInCoolingPeriod || s.sessionEndedAt === null
  ).length;

  const completedSessions = sessions.filter((s) => s.sessionEndedAt !== null);
  const avgReviewsPerSession =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.reviewsInSession, 0) /
        completedSessions.length
      : 0;

  const reachedLimit = completedSessions.filter(
    (s) => s.reviewsInSession >= s.maxReviewsPerSession
  ).length;
  const completionRate =
    completedSessions.length > 0
      ? (reachedLimit / completedSessions.length) * 100
      : 0;

  const coolingPeriods = sessions.filter((s) => s.isInCoolingPeriod);
  const totalCoolingPeriods = coolingPeriods.length;
  const activeNow = coolingPeriods.filter(
    (s) => s.coolingPeriodEndsAt && s.coolingPeriodEndsAt > new Date()
  ).length;

  const avgDurationHours =
    coolingPeriods.length > 0
      ? coolingPeriods.reduce((sum, s) => sum + s.coolingPeriodHours, 0) /
        coolingPeriods.length
      : 0;

  return {
    tier,
    sessions: {
      totalSessions,
      activeSessions,
      avgReviewsPerSession: Math.round(avgReviewsPerSession * 10) / 10,
      completionRate: Math.round(completionRate * 10) / 10,
    },
    coolingPeriods: {
      totalCoolingPeriods,
      avgDurationHours: Math.round(avgDurationHours * 10) / 10,
      activeNow,
    },
  };
}

export async function getAllTiersSessionStats(
  startDate: Date,
  endDate: Date
): Promise<TierSessionStats[]> {
  const tiers: SubscriptionTier[] = ["STARTER", "HERO", "LEGEND"];
  const stats = await Promise.all(
    tiers.map((tier) => getSessionStatsByTier(tier, startDate, endDate))
  );
  return stats;
}

export async function getSessionEventsByUser(
  userId: string,
  limit: number = 50
) {
  return await prisma.subscriptionHistory.findMany({
    where: {
      userId,
      action: {
        in: [
          "SESSION_STARTED",
          "SESSION_LIMIT_REACHED",
          "COOLING_PERIOD_ENTERED",
          "COOLING_PERIOD_ENDED",
          "SESSION_COMPLETED",
          "SESSION_WARNING",
        ],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

export async function getRecentSessionEvents(limit: number = 100) {
  return await prisma.subscriptionHistory.findMany({
    where: {
      action: {
        in: [
          "SESSION_STARTED",
          "SESSION_LIMIT_REACHED",
          "COOLING_PERIOD_ENTERED",
          "COOLING_PERIOD_ENDED",
          "SESSION_COMPLETED",
        ],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          subscriptionTier: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}
