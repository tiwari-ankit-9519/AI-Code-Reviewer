// lib/actions/user-subscription.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserSubscription as getUserSubFromUtils } from "@/lib/subscription/subscription-utils";

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

export async function getUserSubscriptionWithStripe() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Use the getUserSubscription from subscription-utils which has all the fields
  const user = await getUserSubFromUtils(session.user.id);

  // Try to get Stripe subscription details if available
  let stripeSubscription = null;
  if (user.stripeCustomerId) {
    stripeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        stripeSubscriptionId: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        amount: true,
        currency: true,
        cancelAtPeriodEnd: true,
      },
    });
  }

  return {
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionStartDate: user.subscriptionStartDate,
    subscriptionEndDate: user.subscriptionEndDate,
    trialEndsAt: user.trialEndsAt,
    isTrialUsed: user.isTrialUsed,
    monthlySubmissionCount: user.monthlySubmissionCount,
    stripeCustomerId: user.stripeCustomerId,
    currentPeriodStart: stripeSubscription?.currentPeriodStart || null,
    currentPeriodEnd: stripeSubscription?.currentPeriodEnd || null,
    amount: stripeSubscription?.amount || 0,
    currency: stripeSubscription?.currency || "inr",
    cancelAtPeriodEnd: stripeSubscription?.cancelAtPeriodEnd || false,
  };
}
