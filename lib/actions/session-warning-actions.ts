// lib/actions/session-warning-actions.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkSessionWarning } from "@/lib/services/session-warning-service";

export async function getSessionWarning() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      shouldWarn: false,
      reviewsRemaining: 0,
      maxReviews: 0,
      warningLevel: "none" as const,
      message: "",
      coolingPeriodHours: 0,
    };
  }

  const warning = await checkSessionWarning(session.user.id);

  const activeSession = await prisma.reviewSession.findFirst({
    where: {
      userId: session.user.id,
      sessionEndedAt: null,
    },
    orderBy: {
      sessionStartedAt: "desc",
    },
    select: {
      coolingPeriodHours: true,
    },
  });

  return {
    ...warning,
    coolingPeriodHours: activeSession?.coolingPeriodHours || 24,
  };
}
