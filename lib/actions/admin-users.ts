"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SubscriptionTier } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized - No session");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized - Admin access required");
  }

  return session;
}

export async function changeTierAdmin(
  userId: string,
  newTier: string,
  reason: string
) {
  await requireAdmin();

  if (!(newTier in SubscriptionTier)) {
    throw new Error("Invalid tier");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: newTier as SubscriptionTier,
        monthlySubmissionCount: 0,
        submissionLimitNotified: false,
      },
    }),
    prisma.subscriptionHistory.create({
      data: {
        userId,
        action: "SUBSCRIPTION_UPGRADED",
        fromTier: user.subscriptionTier,
        toTier: newTier as SubscriptionTier,
        reason,
      },
    }),
  ]);

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function resetSubmissionCountAdmin(userId: string) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlySubmissionCount: 0,
      submissionLimitNotified: false,
    },
  });

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}

export async function extendTrialAdmin(userId: string, days: number) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEndsAt: true, subscriptionStatus: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.subscriptionStatus !== "TRIALING") {
    throw new Error("User is not on trial");
  }

  const currentTrialEnd = user.trialEndsAt || new Date();
  const newTrialEnd = new Date(
    currentTrialEnd.getTime() + days * 24 * 60 * 60 * 1000
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      trialEndsAt: newTrialEnd,
    },
  });

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}
