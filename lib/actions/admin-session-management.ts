// lib/actions/admin-session-management.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleAdminCoolingPeriodReset } from "@/lib/services/edge-case-handlers";
import { revalidatePath } from "next/cache";

export async function resetUserCoolingPeriod(userId: string) {
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
      isInCoolingPeriod: true,
      coolingPeriodEndsAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isInCoolingPeriod) {
    throw new Error("User is not in a cooling period");
  }

  await handleAdminCoolingPeriodReset(userId, session.user.id);

  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}`);

  return {
    success: true,
    message: `Cooling period reset for ${user.email}`,
  };
}

export async function getUserSessionDetails(userId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      reviewSessions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const activeSession = user.currentSessionId
    ? await prisma.reviewSession.findUnique({
        where: { id: user.currentSessionId },
      })
    : null;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.subscriptionTier,
      isInCoolingPeriod: user.isInCoolingPeriod,
      coolingPeriodEndsAt: user.coolingPeriodEndsAt,
      monthlySubmissionCount: user.monthlySubmissionCount,
    },
    activeSession,
    recentSessions: user.reviewSessions,
  };
}

export async function forceEndUserSession(userId: string, sessionId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  const reviewSession = await prisma.reviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!reviewSession) {
    throw new Error("Session not found");
  }

  if (reviewSession.userId !== userId) {
    throw new Error("Session does not belong to user");
  }

  await prisma.reviewSession.update({
    where: { id: sessionId },
    data: {
      sessionEndedAt: new Date(),
      isInCoolingPeriod: false,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentSessionId: null,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  await prisma.subscriptionHistory.create({
    data: {
      userId,
      action: "SESSION_FORCE_ENDED",
      toTier: user?.subscriptionTier || "STARTER",
      reason: "admin_override",
      metadata: {
        sessionId,
        endedBy: session.user.id,
        timestamp: new Date().toISOString(),
      },
    },
  });

  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}`);

  return {
    success: true,
    message: "Session ended successfully",
  };
}
