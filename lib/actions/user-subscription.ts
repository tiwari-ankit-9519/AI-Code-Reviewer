// lib/actions/user-subscription.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isTrialing =
    user.subscriptionStatus === "TRIALING" &&
    user.trialEndsAt &&
    new Date(user.trialEndsAt) > new Date();

  return {
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    isTrialing: !!isTrialing,
  };
}
