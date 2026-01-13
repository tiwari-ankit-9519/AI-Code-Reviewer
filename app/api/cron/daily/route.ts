// app/api/cron/daily/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncStripeSubscriptions } from "@/lib/cron/tasks";
import { logCronExecution } from "@/lib/cron/logger";
import { resetAllUsers } from "@/lib/subscription/reset-service";
import { runMonthlyTasks } from "@/lib/analytics/monthly-tasks";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const now = new Date();
  const isFirstDayOfMonth = now.getDate() === 1;

  const results = {
    trialsExpired: 0,
    subscriptionsSynced: 0,
    monthlyResetCount: 0,
    snapshotGenerated: false,
    dataArchived: false,
    errors: [] as string[],
  };

  try {
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
    }

    results.trialsExpired = expiredUsers.length;
    console.log(`[DAILY] Expired ${expiredUsers.length} trials`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Trial expiration failed: ${errorMessage}`);
    console.error("Trial expiration error:", error);
  }

  try {
    results.subscriptionsSynced = await syncStripeSubscriptions();
    console.log(
      `[DAILY] Synced ${results.subscriptionsSynced} Stripe subscriptions`
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Stripe sync failed: ${errorMessage}`);
    console.error("Stripe sync error:", error);
  }

  if (isFirstDayOfMonth) {
    try {
      const resetResult = await resetAllUsers();
      results.monthlyResetCount = resetResult.resetCount;
      console.log(
        `[DAILY] Reset ${resetResult.resetCount} user submission counts`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      results.errors.push(`Monthly reset failed: ${errorMessage}`);
      console.error("Monthly reset error:", error);
    }

    try {
      const monthlyTasksResult = await runMonthlyTasks();
      results.snapshotGenerated = monthlyTasksResult.snapshotGenerated;
      results.dataArchived = monthlyTasksResult.dataArchived;

      if (monthlyTasksResult.errors.length > 0) {
        results.errors.push(...monthlyTasksResult.errors);
      }

      console.log(`[DAILY] Monthly tasks completed`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      results.errors.push(`Monthly tasks failed: ${errorMessage}`);
      console.error("Monthly tasks error:", error);
    }
  }

  await logCronExecution("daily-admin-tasks", results, startTime);

  return NextResponse.json({
    success: results.errors.length === 0,
    ...results,
    timestamp: new Date().toISOString(),
  });
}
