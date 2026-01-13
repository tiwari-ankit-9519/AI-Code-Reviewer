// lib/utils/tier-features.ts

import { SubscriptionTier, SupportLevel } from "@prisma/client";

export const FILE_SIZE_LIMITS = {
  STARTER: 50 * 1024,
  HERO: 100 * 1024,
  LEGEND: 500 * 1024,
} as const;

export const TIER_SUPPORT_LEVELS = {
  STARTER: SupportLevel.COMMUNITY,
  HERO: SupportLevel.PRIORITY,
  LEGEND: SupportLevel.DEDICATED,
} as const;

export const TIER_API_ACCESS = {
  STARTER: false,
  HERO: true,
  LEGEND: true,
} as const;

export function getMaxFileSize(tier: SubscriptionTier): number {
  return FILE_SIZE_LIMITS[tier];
}

export function getMaxFileSizeDisplay(tier: SubscriptionTier): string {
  const sizeInKB = FILE_SIZE_LIMITS[tier] / 1024;
  return `${sizeInKB}KB`;
}

export function isFileSizeAllowed(
  fileSize: number,
  tier: SubscriptionTier
): boolean {
  return fileSize <= FILE_SIZE_LIMITS[tier];
}

export function hasApiAccess(tier: SubscriptionTier): boolean {
  return TIER_API_ACCESS[tier];
}

export function getSupportLevel(tier: SubscriptionTier): SupportLevel {
  return TIER_SUPPORT_LEVELS[tier];
}

export function getSupportLevelDescription(supportLevel: SupportLevel): string {
  const descriptions = {
    [SupportLevel.COMMUNITY]: "Community support via FAQ and email",
    [SupportLevel.PRIORITY]: "Priority email support (24-48hr response)",
    [SupportLevel.DEDICATED]: "Dedicated support (4hr response, phone/video)",
  };
  return descriptions[supportLevel];
}

export function getSupportResponseSLA(supportLevel: SupportLevel): number {
  const sla = {
    [SupportLevel.COMMUNITY]: 72,
    [SupportLevel.PRIORITY]: 48,
    [SupportLevel.DEDICATED]: 4,
  };
  return sla[supportLevel];
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getTierFeatures(tier: SubscriptionTier) {
  return {
    tier,
    maxFileSize: getMaxFileSize(tier),
    maxFileSizeDisplay: getMaxFileSizeDisplay(tier),
    apiAccess: hasApiAccess(tier),
    supportLevel: getSupportLevel(tier),
    supportDescription: getSupportLevelDescription(getSupportLevel(tier)),
    supportResponseSLA: getSupportResponseSLA(getSupportLevel(tier)),
  };
}

export function needsUpgrade(
  currentTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  const tierOrder = {
    STARTER: 0,
    HERO: 1,
    LEGEND: 2,
  };

  return tierOrder[currentTier] < tierOrder[requiredTier];
}

export function getUpgradeRecommendation(
  currentTier: SubscriptionTier,
  averageFileSize: number,
  needsApi: boolean = false
): SubscriptionTier | null {
  if (needsApi && !hasApiAccess(currentTier)) {
    return SubscriptionTier.HERO;
  }

  const currentLimit = getMaxFileSize(currentTier);
  if (averageFileSize > currentLimit * 0.8) {
    if (currentTier === SubscriptionTier.STARTER) {
      return SubscriptionTier.HERO;
    }
    if (currentTier === SubscriptionTier.HERO) {
      return SubscriptionTier.LEGEND;
    }
  }

  return null;
}

export type TierFeatures = ReturnType<typeof getTierFeatures>;
