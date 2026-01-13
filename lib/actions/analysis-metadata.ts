// lib/actions/analysis-metadata.ts

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSecurityCheckMetadata(submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const submission = await prisma.codeSubmission.findUnique({
    where: { id: submissionId },
    select: { userId: true },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const metadata = await prisma.securityCheckMetadata.findUnique({
    where: { submissionId },
  });

  return metadata;
}

export async function getPerformanceCheckMetadata(submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const submission = await prisma.codeSubmission.findUnique({
    where: { id: submissionId },
    select: { userId: true },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  const metadata = await prisma.performanceCheckMetadata.findUnique({
    where: { submissionId },
  });

  return metadata;
}

export async function getUserCheckLevels(userId?: string) {
  const session = await auth();
  const targetUserId = userId || session?.user?.id;

  if (!targetUserId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      securityCheckLevel: true,
      performanceCheckLevel: true,
      subscriptionTier: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateUserCheckLevels(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const levelMap: Record<
    string,
    {
      security: "BASIC" | "ADVANCED" | "ENTERPRISE";
      performance: "BASIC" | "ADVANCED" | "ENTERPRISE";
    }
  > = {
    STARTER: { security: "BASIC", performance: "BASIC" },
    HERO: { security: "ADVANCED", performance: "ADVANCED" },
    LEGEND: { security: "ENTERPRISE", performance: "ENTERPRISE" },
  };

  const levels = levelMap[user.subscriptionTier] || levelMap.STARTER;

  await prisma.user.update({
    where: { id: userId },
    data: {
      securityCheckLevel: levels.security,
      performanceCheckLevel: levels.performance,
    },
  });

  return { success: true };
}
