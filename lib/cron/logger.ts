import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function logCronExecution(
  jobName: string,
  results: Record<string, unknown>,
  startTime: number = Date.now()
) {
  const duration = Date.now() - startTime;
  const errors = Array.isArray(results.errors) ? results.errors : [];
  const status = errors.length > 0 ? "PARTIAL" : "SUCCESS";

  await prisma.cronLog.create({
    data: {
      jobName,
      status,
      results: results as Prisma.InputJsonValue,
      duration,
      executedAt: new Date(),
      error: errors.length > 0 ? errors.join("; ") : null,
    },
  });

  return {
    jobName,
    status,
    duration,
    executedAt: new Date(),
  };
}

export async function getCronLogs(jobName?: string, limit: number = 50) {
  return await prisma.cronLog.findMany({
    where: jobName ? { jobName } : undefined,
    orderBy: { executedAt: "desc" },
    take: limit,
  });
}

export async function getLastCronExecution(jobName: string) {
  return await prisma.cronLog.findFirst({
    where: { jobName },
    orderBy: { executedAt: "desc" },
  });
}

export async function getCronStats(jobName: string, days: number = 30) {
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
    totalRuns,
    successfulRuns,
    failedRuns,
    partialRuns,
    successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0,
    avgDuration: Math.round(avgDuration),
    lastRun: logs[0]?.executedAt || null,
    periodDays: days,
  };
}
