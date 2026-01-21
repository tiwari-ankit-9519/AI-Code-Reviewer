"use server";

import { auth } from "@/lib/auth";
import { canUserSubmit } from "@/lib/subscription/subscription-utils";

export async function getUsageData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = await canUserSubmit(session.user.id);

  const tierLimits: Record<string, { size: number; label: string }> = {
    STARTER: { size: 50 * 1024, label: "50KB" },
    HERO: { size: 100 * 1024, label: "100KB" },
    LEGEND: { size: 500 * 1024, label: "500KB" },
  };

  const limits = tierLimits[data.tier] || tierLimits.STARTER;
  const limit = typeof data.limit === "number" ? data.limit : 999999;
  const remaining = limit - data.currentCount;
  const percentage = limit > 0 ? (data.currentCount / limit) * 100 : 0;

  return {
    tier: data.tier,
    used: data.currentCount,
    limit: data.limit,
    remaining,
    percentage,
    maxFileSize: limits.size,
    maxFileSizeLabel: limits.label,
  };
}
