"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkCoolingPeriodStatus,
  getActiveSession,
} from "@/lib/services/review-session-service";

export async function checkSubmissionEligibility() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      canSubmit: false,
      reason: "Not authenticated",
      coolingStatus: null,
      sessionProgress: null,
      tier: null,
    };
  }

  const coolingStatus = await checkCoolingPeriodStatus(session.user.id);

  if (coolingStatus.isInCoolingPeriod) {
    return {
      canSubmit: false,
      reason: "cooling_period",
      coolingStatus,
      sessionProgress: null,
      tier: null,
    };
  }

  // Get user tier info
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionTier: true, monthlySubmissionCount: true },
  });

  // Check if user is HERO tier and get session progress
  if (user?.subscriptionTier === "HERO") {
    const activeSession = await getActiveSession(session.user.id);
    return {
      canSubmit: true,
      reason: null,
      coolingStatus,
      sessionProgress: activeSession,
      tier: "HERO",
    };
  }

  // Check STARTER tier limits
  if (
    user?.subscriptionTier === "STARTER" &&
    user.monthlySubmissionCount >= 5
  ) {
    return {
      canSubmit: false,
      reason: "monthly_limit",
      coolingStatus,
      sessionProgress: null,
      tier: "STARTER",
    };
  }

  return {
    canSubmit: true,
    reason: null,
    coolingStatus,
    sessionProgress: null,
    tier: user?.subscriptionTier || null,
  };
}
