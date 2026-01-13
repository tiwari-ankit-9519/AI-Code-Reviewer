// lib/analytics/session-events.ts
import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export async function trackSessionStarted(
  userId: string,
  sessionId: string,
  tier: SubscriptionTier,
  maxReviews: number
): Promise<void> {
  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "SESSION_STARTED",
      toTier: tier,
      metadata: {
        sessionId,
        maxReviews,
        timestamp: new Date().toISOString(),
      },
    },
  });
}

export async function trackSessionLimitReached(
  userId: string,
  sessionId: string,
  tier: SubscriptionTier,
  reviewsCompleted: number
): Promise<void> {
  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "SESSION_LIMIT_REACHED",
      toTier: tier,
      metadata: {
        sessionId,
        reviewsCompleted,
        timestamp: new Date().toISOString(),
      },
    },
  });
}

export async function trackCoolingPeriodEntered(
  userId: string,
  sessionId: string,
  tier: SubscriptionTier,
  coolingHours: number,
  endsAt: Date
): Promise<void> {
  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "COOLING_PERIOD_ENTERED",
      toTier: tier,
      metadata: {
        sessionId,
        coolingHours,
        endsAt: endsAt.toISOString(),
        timestamp: new Date().toISOString(),
      },
    },
  });
}

export async function trackCoolingPeriodEnded(
  userId: string,
  tier: SubscriptionTier,
  duration: number
): Promise<void> {
  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "COOLING_PERIOD_ENDED",
      toTier: tier,
      metadata: {
        durationHours: duration,
        timestamp: new Date().toISOString(),
      },
    },
  });
}

export async function trackSessionCompleted(
  userId: string,
  sessionId: string,
  tier: SubscriptionTier,
  reviewsCompleted: number,
  sessionDuration: number
): Promise<void> {
  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "SESSION_COMPLETED",
      toTier: tier,
      metadata: {
        sessionId,
        reviewsCompleted,
        sessionDurationMinutes: sessionDuration,
        timestamp: new Date().toISOString(),
      },
    },
  });
}
