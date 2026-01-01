"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resetAllUsers } from "@/lib/subscription/reset-service";
import { syncStripeSubscriptions } from "@/lib/cron/tasks";
import { generateMonthlySnapshot } from "@/lib/analytics/generate-snapshot";
import { emailMonthlyReport } from "@/lib/email/admin-report";
import {
  sendTrialEndingEmail,
  sendTrialExpiredEmail,
} from "@/lib/email/trial-emails";
import { logCronExecution } from "@/lib/cron/logger";

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

export async function triggerExpireTrials() {
  await requireAdmin();

  const startTime = Date.now();
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
          reason: "manual_trigger",
          metadata: {
            expiredAt: now.toISOString(),
            triggeredBy: "admin",
          },
        },
      }),
    ]);

    try {
      await sendTrialExpiredEmail(user.id);
    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error);
    }
  }

  await logCronExecution(
    "manual-expire-trials",
    { expiredCount: expiredUsers.length },
    startTime
  );

  return {
    success: true,
    expiredCount: expiredUsers.length,
    users: expiredUsers.map((u) => ({ email: u.email, name: u.name })),
  };
}

export async function triggerTrialReminders() {
  await requireAdmin();

  const startTime = Date.now();
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
    } catch (error) {
      console.error(`Failed to send reminder to ${user.email}:`, error);
    }
  }

  await logCronExecution(
    "manual-trial-reminders",
    { remindedCount: endingSoon.length },
    startTime
  );

  return {
    success: true,
    remindedCount: endingSoon.length,
    users: endingSoon.map((u) => ({ email: u.email, name: u.name })),
  };
}

export async function triggerResetSubmissions() {
  await requireAdmin();

  const startTime = Date.now();
  const result = await resetAllUsers();

  await logCronExecution(
    "manual-reset-submissions",
    { resetCount: result.resetCount },
    startTime
  );

  return {
    success: true,
    resetCount: result.resetCount,
    message: result.message,
  };
}

export async function triggerSyncStripe() {
  await requireAdmin();

  const startTime = Date.now();
  const syncedCount = await syncStripeSubscriptions();

  await logCronExecution("manual-stripe-sync", { syncedCount }, startTime);

  return {
    success: true,
    syncedCount,
    message: `Synced ${syncedCount} subscriptions with Stripe`,
  };
}

export async function triggerGenerateSnapshot() {
  await requireAdmin();

  const startTime = Date.now();
  const now = new Date();
  const lastMonth = {
    year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
    month: now.getMonth() === 0 ? 12 : now.getMonth(),
  };

  const snapshot = await generateMonthlySnapshot(
    lastMonth.year,
    lastMonth.month
  );

  await logCronExecution(
    "manual-generate-snapshot",
    { period: snapshot.period },
    startTime
  );

  return {
    success: true,
    snapshot,
    message: `Generated snapshot for ${snapshot.period}`,
  };
}

export async function triggerEmailAdminReport() {
  await requireAdmin();

  if (!process.env.ADMIN_EMAIL) {
    throw new Error("ADMIN_EMAIL environment variable not set");
  }

  const startTime = Date.now();
  const now = new Date();
  const lastMonth = {
    year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
    month: now.getMonth() === 0 ? 12 : now.getMonth(),
  };

  const snapshot = await generateMonthlySnapshot(
    lastMonth.year,
    lastMonth.month
  );

  await emailMonthlyReport(process.env.ADMIN_EMAIL, snapshot);

  await logCronExecution(
    "manual-email-report",
    { period: snapshot.period, sentTo: process.env.ADMIN_EMAIL },
    startTime
  );

  return {
    success: true,
    sentTo: process.env.ADMIN_EMAIL,
    period: snapshot.period,
    message: "Report emailed successfully",
  };
}

export async function getCronJobsStatus() {
  await requireAdmin();

  const jobs = ["daily-tasks", "monthly-tasks"];
  const jobStatus = [];

  for (const jobName of jobs) {
    const lastExecution = await prisma.cronLog.findFirst({
      where: { jobName },
      orderBy: { executedAt: "desc" },
    });

    const recentExecutions = await prisma.cronLog.findMany({
      where: { jobName },
      orderBy: { executedAt: "desc" },
      take: 10,
    });

    const totalRuns = await prisma.cronLog.count({
      where: { jobName },
    });

    const successfulRuns = await prisma.cronLog.count({
      where: { jobName, status: "SUCCESS" },
    });

    jobStatus.push({
      jobName,
      lastExecution: lastExecution
        ? {
            executedAt: lastExecution.executedAt,
            status: lastExecution.status,
            duration: lastExecution.duration,
            results: lastExecution.results,
            error: lastExecution.error,
          }
        : null,
      recentExecutions: recentExecutions.map((exec) => ({
        executedAt: exec.executedAt,
        status: exec.status,
        duration: exec.duration,
        results: exec.results,
      })),
      stats: {
        totalRuns,
        successfulRuns,
        successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
      },
    });
  }

  return jobStatus;
}

export async function getCronJobStats(jobName: string, days: number = 30) {
  await requireAdmin();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const logs = await prisma.cronLog.findMany({
    where: {
      jobName,
      executedAt: { gte: cutoffDate },
    },
    orderBy: { executedAt: "desc" },
  });

  const totalRuns = logs.length;
  const successfulRuns = logs.filter((log) => log.status === "SUCCESS").length;
  const failedRuns = logs.filter((log) => log.status === "FAILED").length;
  const partialRuns = logs.filter((log) => log.status === "PARTIAL").length;

  const avgDuration =
    totalRuns > 0
      ? logs.reduce((sum, log) => sum + log.duration, 0) / totalRuns
      : 0;

  return {
    jobName,
    periodDays: days,
    totalRuns,
    successfulRuns,
    failedRuns,
    partialRuns,
    successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
    avgDuration: Math.round(avgDuration),
    lastRun: logs[0]?.executedAt || null,
    recentLogs: logs.slice(0, 20),
  };
}

export async function getAllManualTriggers() {
  await requireAdmin();

  const manualLogs = await prisma.cronLog.findMany({
    where: {
      jobName: {
        startsWith: "manual-",
      },
    },
    orderBy: { executedAt: "desc" },
    take: 50,
  });

  return manualLogs.map((log) => ({
    jobName: log.jobName.replace("manual-", ""),
    executedAt: log.executedAt,
    status: log.status,
    duration: log.duration,
    results: log.results,
    error: log.error,
  }));
}
