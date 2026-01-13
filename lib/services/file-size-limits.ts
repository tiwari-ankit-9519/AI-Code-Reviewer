import { SubscriptionTier } from "@prisma/client";

export const FILE_SIZE_LIMITS = {
  STARTER: 50 * 1024,
  HERO: 100 * 1024,
  LEGEND: 500 * 1024,
} as const;

export function getFileSizeLimit(tier: SubscriptionTier): number {
  return FILE_SIZE_LIMITS[tier];
}

export function formatFileSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

export function validateFileSize(
  fileSize: number,
  tier: SubscriptionTier
): {
  valid: boolean;
  limit: number;
  message?: string;
} {
  const limit = getFileSizeLimit(tier);

  if (fileSize > limit) {
    return {
      valid: false,
      limit,
      message: `File size ${formatFileSize(
        fileSize
      )} exceeds your ${tier} tier limit of ${formatFileSize(limit)}. ${
        tier === "STARTER"
          ? "Upgrade to HERO for 100KB limit."
          : tier === "HERO"
          ? "Upgrade to LEGEND for 500KB limit."
          : ""
      }`,
    };
  }

  return {
    valid: true,
    limit,
  };
}
