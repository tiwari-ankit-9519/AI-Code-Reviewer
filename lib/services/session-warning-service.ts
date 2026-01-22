// lib/services/session-warning-service.ts
import { prisma } from "@/lib/prisma";

interface SessionWarningCheck {
  shouldWarn: boolean;
  reviewsRemaining: number;
  maxReviews: number;
  warningLevel: "none" | "low" | "critical";
  message: string;
}

export async function checkSessionWarning(
  userId: string,
): Promise<SessionWarningCheck> {
  const session = await prisma.reviewSession.findFirst({
    where: {
      userId,
      sessionEndedAt: null, // Only active sessions
    },
    orderBy: {
      sessionStartedAt: "desc",
    },
  });

  if (!session) {
    return {
      shouldWarn: false,
      reviewsRemaining: 0,
      maxReviews: 0,
      warningLevel: "none",
      message: "",
    };
  }

  const reviewsRemaining =
    session.maxReviewsPerSession - session.reviewsInSession;
  const percentage =
    (session.reviewsInSession / session.maxReviewsPerSession) * 100;

  let warningLevel: "none" | "low" | "critical" = "none";
  let message = "";

  if (reviewsRemaining <= 0) {
    return {
      shouldWarn: false,
      reviewsRemaining: 0,
      maxReviews: session.maxReviewsPerSession,
      warningLevel: "none",
      message: "",
    };
  } else if (reviewsRemaining === 1) {
    warningLevel = "critical";
    message = `Only 1 review remaining! After this submission, you'll enter a ${session.coolingPeriodHours}-hour cooling period.`;
  } else if (reviewsRemaining === 2) {
    warningLevel = "low";
    message = `You have 2 reviews left in this session. Plan accordingly to avoid the cooling period.`;
  } else if (percentage >= 70) {
    warningLevel = "low";
    message = `You've used ${session.reviewsInSession} of ${session.maxReviewsPerSession} reviews in this session.`;
  }

  return {
    shouldWarn: warningLevel !== "none",
    reviewsRemaining,
    maxReviews: session.maxReviewsPerSession,
    warningLevel,
    message,
  };
}

export async function trackSessionWarning(
  userId: string,
  reviewsRemaining: number,
  warningLevel: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) return;

  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "SESSION_WARNING",
      toTier: user.subscriptionTier,
      reason: "session_limit_warning",
      metadata: {
        reviewsRemaining,
        warningLevel,
        timestamp: new Date().toISOString(),
      },
    },
  });
}
