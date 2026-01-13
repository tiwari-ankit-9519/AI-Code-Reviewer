// lib/services/edge-case-handlers.ts
import { prisma } from "@/lib/prisma";
import { SubscriptionTier } from "@prisma/client";

export async function handleTierChangeWithActiveSession(
  userId: string,
  newTier: SubscriptionTier
): Promise<void> {
  const activeSession = await prisma.reviewSession.findFirst({
    where: {
      userId,
      sessionEndedAt: null,
    },
  });

  if (activeSession && activeSession.tier !== newTier) {
    const tierRequiresSessions = newTier === "HERO";

    if (!tierRequiresSessions) {
      await prisma.reviewSession.update({
        where: { id: activeSession.id },
        data: {
          sessionEndedAt: new Date(),
          isInCoolingPeriod: false,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          currentSessionId: null,
          isInCoolingPeriod: false,
          coolingPeriodEndsAt: null,
        },
      });
    } else {
      await prisma.reviewSession.update({
        where: { id: activeSession.id },
        data: {
          tier: newTier,
        },
      });
    }
  }
}

export async function handleConcurrentSubmissionAttempt(
  userId: string,
  currentSessionId: string | null
): Promise<{ canProceed: boolean; sessionId: string | null; reason?: string }> {
  if (!currentSessionId) {
    return { canProceed: true, sessionId: null };
  }

  const session = await prisma.reviewSession.findUnique({
    where: { id: currentSessionId },
  });

  if (!session) {
    await prisma.user.update({
      where: { id: userId },
      data: { currentSessionId: null },
    });
    return { canProceed: true, sessionId: null };
  }

  if (session.reviewsInSession >= session.maxReviewsPerSession) {
    return {
      canProceed: false,
      sessionId: session.id,
      reason:
        "Session limit already reached. Please wait for cooling period to end.",
    };
  }

  return { canProceed: true, sessionId: session.id };
}

export async function handleFailedSubmission(
  userId: string,
  sessionId: string | null,
  shouldRollback: boolean = false
): Promise<void> {
  if (!sessionId || !shouldRollback) {
    return;
  }

  const session = await prisma.reviewSession.findUnique({
    where: { id: sessionId },
  });

  if (session && session.reviewsInSession > 0) {
    await prisma.reviewSession.update({
      where: { id: sessionId },
      data: {
        reviewsInSession: { decrement: 1 },
      },
    });
  }
}

export async function handleMidnightBoundary(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastSubmissionReset: true,
      subscriptionTier: true,
    },
  });

  if (!user) return;

  const now = new Date();
  const lastReset = new Date(user.lastSubmissionReset);

  const isNewMonth =
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear();

  if (isNewMonth && user.subscriptionTier === "STARTER") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlySubmissionCount: 0,
        submissionLimitNotified: false,
        lastSubmissionReset: now,
      },
    });
  }
}

export async function cleanupOrphanedData(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentSessionId: true,
      isInCoolingPeriod: true,
    },
  });

  if (!user) return;

  if (user.currentSessionId) {
    const session = await prisma.reviewSession.findUnique({
      where: { id: user.currentSessionId },
    });

    if (!session || session.sessionEndedAt !== null) {
      await prisma.user.update({
        where: { id: userId },
        data: { currentSessionId: null },
      });
    }
  }

  if (user.isInCoolingPeriod) {
    const now = new Date();
    const userWithCooling = await prisma.user.findUnique({
      where: { id: userId },
      select: { coolingPeriodEndsAt: true },
    });

    if (
      !userWithCooling?.coolingPeriodEndsAt ||
      now >= userWithCooling.coolingPeriodEndsAt
    ) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isInCoolingPeriod: false,
          coolingPeriodEndsAt: null,
        },
      });
    }
  }
}

export async function handleAdminCoolingPeriodReset(
  userId: string,
  adminId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        isInCoolingPeriod: false,
        coolingPeriodEndsAt: null,
      },
    });

    await tx.reviewSession.updateMany({
      where: {
        userId,
        isInCoolingPeriod: true,
      },
      data: {
        isInCoolingPeriod: false,
        coolingPeriodEndsAt: null,
      },
    });

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    await tx.subscriptionHistory.create({
      data: {
        userId,
        action: "COOLING_PERIOD_RESET",
        toTier: user?.subscriptionTier || "STARTER",
        reason: "admin_override",
        metadata: {
          resetBy: adminId,
          timestamp: new Date().toISOString(),
        },
      },
    });
  });
}
