"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/payment/stripe-client";

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

export async function cancelSubscriptionAdmin(
  userId: string,
  immediate: boolean = false
) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
      subscriptionTier: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.stripeCustomerId) {
    throw new Error("User has no Stripe customer ID");
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "active",
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    throw new Error("No active subscription found");
  }

  const subscription = subscriptions.data[0];

  if (immediate) {
    await stripe.subscriptions.cancel(subscription.id);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: "STARTER",
          subscriptionStatus: "CANCELLED",
          subscriptionEndDate: new Date(),
        },
      }),
      prisma.subscriptionHistory.create({
        data: {
          userId,
          action: "SUBSCRIPTION_CANCELLED",
          fromTier: user.subscriptionTier,
          toTier: "STARTER",
          reason: "admin_cancelled_immediate",
        },
      }),
    ]);
  } else {
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    await prisma.subscriptionHistory.create({
      data: {
        userId,
        action: "SUBSCRIPTION_CANCELLED",
        fromTier: user.subscriptionTier,
        toTier: user.subscriptionTier,
        reason: "admin_cancelled_period_end",
      },
    });
  }

  revalidatePath("/dashboard/admin/subscriptions");
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

  revalidatePath("/dashboard/admin/subscriptions");
  return { success: true };
}
