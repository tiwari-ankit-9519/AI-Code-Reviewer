"use server";

import { prisma } from "@/lib/prisma";

export async function checkTrialStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });

  if (!user || user.subscriptionStatus !== "TRIALING" || !user.trialEndsAt) {
    return {
      isInTrial: false,
      daysRemaining: 0,
      trialEndsAt: null,
    };
  }

  const now = new Date();
  const trialEnd = new Date(user.trialEndsAt);
  const daysRemaining = Math.ceil(
    (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    isInTrial: daysRemaining > 0,
    daysRemaining: Math.max(0, daysRemaining),
    trialEndsAt: user.trialEndsAt,
  };
}
