// lib/actions/admin-user-management.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function resetUserSubmissionCount(userId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      subscriptionTier: true,
      monthlySubmissionCount: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Reset monthly submission count
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlySubmissionCount: 0,
      submissionLimitNotified: false,
    },
  });

  // Log the action
  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "SUBMISSION_COUNT_RESET",
      toTier: user.subscriptionTier,
      reason: "admin_reset",
      metadata: {
        resetBy: session.user.id,
        previousCount: user.monthlySubmissionCount,
        timestamp: new Date().toISOString(),
      },
    },
  });

  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}`);

  return {
    success: true,
    message: `Monthly submission count reset for ${user.email}`,
  };
}

export async function resetUserSessionCount(userId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      subscriptionTier: true,
      currentSessionId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.subscriptionTier !== "HERO" && user.subscriptionTier !== "LEGEND") {
    throw new Error("User is not on a tier that uses sessions");
  }

  // Get current active session
  const activeSession = await prisma.reviewSession.findFirst({
    where: {
      userId,
      sessionEndedAt: null,
    },
    orderBy: {
      sessionStartedAt: "desc",
    },
  });

  if (!activeSession) {
    throw new Error("User has no active session to reset");
  }

  // Reset the session count back to 0
  await prisma.reviewSession.update({
    where: { id: activeSession.id },
    data: {
      reviewsInSession: 0,
    },
  });

  // Log the action
  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "SESSION_COUNT_RESET",
      toTier: user.subscriptionTier,
      reason: "admin_reset",
      metadata: {
        resetBy: session.user.id,
        sessionId: activeSession.id,
        previousCount: activeSession.reviewsInSession,
        timestamp: new Date().toISOString(),
      },
    },
  });

  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}`);

  return {
    success: true,
    message: `Session count reset for ${user.email}`,
  };
}

export async function resetUserCompletely(userId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      subscriptionTier: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.$transaction(async (tx) => {
    // Reset monthly count
    await tx.user.update({
      where: { id: userId },
      data: {
        monthlySubmissionCount: 0,
        submissionLimitNotified: false,
        isInCoolingPeriod: false,
        coolingPeriodEndsAt: null,
        currentSessionId: null,
      },
    });

    // End all active sessions
    await tx.reviewSession.updateMany({
      where: {
        userId,
        sessionEndedAt: null,
      },
      data: {
        sessionEndedAt: new Date(),
        isInCoolingPeriod: false,
        coolingPeriodEndsAt: null,
      },
    });

    // Log the action
    await tx.subscriptionHistory.create({
      data: {
        userId,
        action: "COMPLETE_RESET",
        toTier: user.subscriptionTier,
        reason: "admin_reset",
        metadata: {
          resetBy: session.user.id,
          timestamp: new Date().toISOString(),
          resetType: "complete",
        },
      },
    });
  });

  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}`);

  return {
    success: true,
    message: `Complete reset successful for ${user.email}`,
  };
}
