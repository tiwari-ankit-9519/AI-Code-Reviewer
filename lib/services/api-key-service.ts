// lib/services/api-key-service.ts
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export function generateApiKey(): string {
  return `cr_${crypto.randomBytes(32).toString("hex")}`;
}

export async function createApiKey(
  userId: string,
  name: string
): Promise<{ key: string; id: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.subscriptionTier === "STARTER") {
    throw new Error(
      "API access is only available for HERO and LEGEND tiers. Please upgrade your plan."
    );
  }

  const existingKeys = await prisma.apiKey.count({
    where: { userId },
  });

  const maxKeys = user.subscriptionTier === "HERO" ? 3 : 10;

  if (existingKeys >= maxKeys) {
    throw new Error(
      `You've reached the maximum of ${maxKeys} API keys for your tier.`
    );
  }

  const key = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      key,
    },
  });

  return {
    key,
    id: apiKey.id,
  };
}

export async function deleteApiKey(
  userId: string,
  keyId: string
): Promise<void> {
  const apiKey = await prisma.apiKey.findUnique({
    where: { id: keyId },
    select: { userId: true },
  });

  if (!apiKey || apiKey.userId !== userId) {
    throw new Error("API key not found or unauthorized");
  }

  await prisma.apiKey.delete({
    where: { id: keyId },
  });
}

export async function getUserApiKeys(userId: string) {
  return await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  userId?: string;
  tier?: string;
}> {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: {
      user: {
        select: {
          id: true,
          subscriptionTier: true,
        },
      },
    },
  });

  if (!apiKey) {
    return { valid: false };
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    valid: true,
    userId: apiKey.user.id,
    tier: apiKey.user.subscriptionTier,
  };
}
