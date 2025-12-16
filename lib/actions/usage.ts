"use server";

import { auth } from "@/lib/auth";
import {
  getUserSubscription,
  getTierLimits,
} from "@/lib/subscription/subscription-utils";

export async function getUserUsage() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await getUserSubscription(session.user.id);
    const limits = getTierLimits(user.subscriptionTier);

    const isUnlimited = limits.monthlySubmissions === -1;
    const percentage = isUnlimited
      ? 0
      : Math.round(
          (user.monthlySubmissionCount / limits.monthlySubmissions) * 100
        );

    return {
      currentCount: user.monthlySubmissionCount,
      limit: isUnlimited ? "unlimited" : limits.monthlySubmissions,
      percentage,
      tier: user.subscriptionTier,
      isInTrial: user.subscriptionStatus === "TRIALING",
      remaining: isUnlimited
        ? -1
        : limits.monthlySubmissions - user.monthlySubmissionCount,
    };
  } catch (error) {
    console.error("Usage fetch error:", error);
    throw new Error("Failed to fetch usage");
  }
}
