import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncStripeSubscriptions } from "@/lib/cron/tasks";
import { logCronExecution } from "@/lib/cron/logger";
import {
  sendTrialEndingEmail,
  sendTrialExpiredEmail,
} from "@/lib/email/trial-emails";

async function expireTrials() {
  const now = new Date();

  const expiredUsers = await prisma.user.findMany({
    where: {
      subscriptionStatus: "TRIALING",
      trialEndsAt: { lte: now },
    },
    select: {
      id: true,
      email: true,
      name: true,
      trialEndsAt: true,
    },
  });

  for (const user of expiredUsers) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionTier: "STARTER",
          subscriptionStatus: "ACTIVE",
          trialEndsAt: null,
          isTrialUsed: true,
          monthlySubmissionCount: 0,
          submissionLimitNotified: false,
        },
      }),
      prisma.subscriptionHistory.create({
        data: {
          userId: user.id,
          action: "TRIAL_EXPIRED",
          fromTier: "HERO",
          toTier: "STARTER",
          reason: "trial_expired",
          metadata: {
            expiredAt: now.toISOString(),
          },
        },
      }),
    ]);

    try {
      await sendTrialExpiredEmail(user.id);
      console.log(`Trial expired email sent to ${user.email}`);
    } catch (error) {
      console.error(
        `Failed to send trial expired email to ${user.email}:`,
        error
      );
    }
  }

  return expiredUsers.length;
}

async function sendTrialReminders() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const endingSoon = await prisma.user.findMany({
    where: {
      subscriptionStatus: "TRIALING",
      trialEndsAt: {
        gte: now,
        lte: tomorrow,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      trialEndsAt: true,
    },
  });

  for (const user of endingSoon) {
    try {
      await sendTrialEndingEmail(user.id, user.trialEndsAt!);
      console.log(`Trial ending email sent to ${user.email}`);
    } catch (error) {
      console.error(
        `Failed to send trial ending email to ${user.email}:`,
        error
      );
    }
  }

  return endingSoon.length;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const results = {
    trialsExpired: 0,
    trialsReminded: 0,
    subscriptionsSynced: 0,
    errors: [] as string[],
  };

  try {
    results.trialsExpired = await expireTrials();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Trial expiration failed: ${errorMessage}`);
    console.error("Trial expiration error:", error);
  }

  try {
    results.trialsReminded = await sendTrialReminders();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Trial reminders failed: ${errorMessage}`);
    console.error("Trial reminders error:", error);
  }

  try {
    results.subscriptionsSynced = await syncStripeSubscriptions();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Stripe sync failed: ${errorMessage}`);
    console.error("Stripe sync error:", error);
  }

  await logCronExecution("daily-tasks", results, startTime);

  return NextResponse.json({
    success: results.errors.length === 0,
    ...results,
    timestamp: new Date().toISOString(),
  });
}
