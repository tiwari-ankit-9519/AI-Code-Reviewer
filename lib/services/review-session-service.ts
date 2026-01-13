// lib/services/review-session-service.ts
import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";
import { getTierLimitConfig } from "./tier-config-service";
import {
  trackSessionStarted,
  trackSessionLimitReached,
  trackCoolingPeriodEntered,
  trackSessionCompleted,
} from "@/lib/analytics/session-events";

interface SessionDetails {
  sessionId: string;
  reviewsInSession: number;
  maxReviewsPerSession: number;
  tier: SubscriptionTier;
}

interface CoolingPeriodStatus {
  isInCoolingPeriod: boolean;
  endsAt: Date | null;
  hoursRemaining: number;
}

interface CanStartSessionResult {
  allowed: boolean;
  reason?: string;
}

export async function startReviewSession(
  userId: string
): Promise<SessionDetails> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const tierConfig = await getTierLimitConfig(user.subscriptionTier);

  const session = await prisma.reviewSession.create({
    data: {
      userId,
      tier: user.subscriptionTier,
      reviewsInSession: 1,
      maxReviewsPerSession: tierConfig.reviewsPerSession,
      coolingPeriodHours: tierConfig.coolingPeriodHours,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { currentSessionId: session.id },
  });

  await trackSessionStarted(
    userId,
    session.id,
    user.subscriptionTier,
    tierConfig.reviewsPerSession
  );

  return {
    sessionId: session.id,
    reviewsInSession: session.reviewsInSession,
    maxReviewsPerSession: session.maxReviewsPerSession,
    tier: session.tier,
  };
}

export async function incrementSessionReviews(
  userId: string,
  sessionId: string
): Promise<void> {
  const session = await prisma.reviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  const updatedSession = await prisma.reviewSession.update({
    where: { id: sessionId },
    data: {
      reviewsInSession: { increment: 1 },
    },
  });

  if (updatedSession.reviewsInSession >= updatedSession.maxReviewsPerSession) {
    await trackSessionLimitReached(
      userId,
      sessionId,
      updatedSession.tier,
      updatedSession.reviewsInSession
    );
    await endSession(sessionId);
  }
}

export async function endSession(sessionId: string): Promise<void> {
  const session = await prisma.reviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  const coolingPeriodEndsAt = new Date(
    Date.now() + session.coolingPeriodHours * 60 * 60 * 1000
  );

  const sessionDurationMinutes = Math.floor(
    (Date.now() - session.sessionStartedAt.getTime()) / (1000 * 60)
  );

  await prisma.reviewSession.update({
    where: { id: sessionId },
    data: {
      sessionEndedAt: new Date(),
      isInCoolingPeriod: session.coolingPeriodHours > 0,
      coolingPeriodEndsAt:
        session.coolingPeriodHours > 0 ? coolingPeriodEndsAt : null,
    },
  });

  if (session.coolingPeriodHours > 0) {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        isInCoolingPeriod: true,
        coolingPeriodEndsAt,
        currentSessionId: null,
      },
    });

    await trackCoolingPeriodEntered(
      session.userId,
      session.id,
      session.tier,
      session.coolingPeriodHours,
      coolingPeriodEndsAt
    );
  } else {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        currentSessionId: null,
      },
    });
  }

  await trackSessionCompleted(
    session.userId,
    sessionId,
    session.tier,
    session.reviewsInSession,
    sessionDurationMinutes
  );
}

export async function checkCoolingPeriodStatus(
  userId: string
): Promise<CoolingPeriodStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isInCoolingPeriod: true,
      coolingPeriodEndsAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isInCoolingPeriod || !user.coolingPeriodEndsAt) {
    return {
      isInCoolingPeriod: false,
      endsAt: null,
      hoursRemaining: 0,
    };
  }

  const now = new Date();
  const endsAt = new Date(user.coolingPeriodEndsAt);

  if (now >= endsAt) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isInCoolingPeriod: false,
        coolingPeriodEndsAt: null,
      },
    });

    return {
      isInCoolingPeriod: false,
      endsAt: null,
      hoursRemaining: 0,
    };
  }

  const millisecondsRemaining = endsAt.getTime() - now.getTime();
  const hoursRemaining = Math.ceil(millisecondsRemaining / (1000 * 60 * 60));

  return {
    isInCoolingPeriod: true,
    endsAt,
    hoursRemaining,
  };
}

export async function canStartNewSession(
  userId: string
): Promise<CanStartSessionResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      monthlySubmissionCount: true,
      isInCoolingPeriod: true,
      coolingPeriodEndsAt: true,
    },
  });

  if (!user) {
    return {
      allowed: false,
      reason: "User not found",
    };
  }

  const coolingStatus = await checkCoolingPeriodStatus(userId);
  if (coolingStatus.isInCoolingPeriod) {
    return {
      allowed: false,
      reason: `Please wait ${coolingStatus.hoursRemaining} hours before submitting again`,
    };
  }

  if (user.subscriptionTier === "STARTER" && user.monthlySubmissionCount >= 5) {
    return {
      allowed: false,
      reason:
        "Monthly submission limit reached. Upgrade to Hero for unlimited reviews.",
    };
  }

  return {
    allowed: true,
  };
}

export async function getActiveSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentSessionId: true,
      subscriptionTier: true,
    },
  });

  if (!user?.currentSessionId) {
    return null;
  }

  const session = await prisma.reviewSession.findUnique({
    where: { id: user.currentSessionId },
  });

  return session;
}
