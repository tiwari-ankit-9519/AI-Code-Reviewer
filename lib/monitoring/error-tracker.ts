// lib/monitoring/error-tracker.ts
import { prisma } from "@/lib/prisma";

interface ErrorMetrics {
  totalErrors: number;
  criticalErrors: number;
  recentErrors: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
}

export async function trackError(
  errorType: string,
  errorMessage: string,
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  console.error(`[ERROR_TRACKER] ${errorType}: ${errorMessage}`, {
    userId,
    metadata,
    timestamp: new Date().toISOString(),
  });

  if (process.env.NODE_ENV === "production") {
  }
}

export async function getErrorMetrics(
  startDate: Date,
  endDate: Date
): Promise<ErrorMetrics> {
  const cronLogs = await prisma.cronLog.findMany({
    where: {
      executedAt: {
        gte: startDate,
        lte: endDate,
      },
      status: "FAILED",
    },
    orderBy: {
      executedAt: "desc",
    },
    take: 50,
  });

  const criticalLogs = cronLogs.filter((log) =>
    log.error?.toLowerCase().includes("critical")
  );

  return {
    totalErrors: cronLogs.length,
    criticalErrors: criticalLogs.length,
    recentErrors: cronLogs.slice(0, 10).map((log) => ({
      type: log.jobName,
      message: log.error || "Unknown error",
      timestamp: log.executedAt,
    })),
  };
}

export async function checkSystemHealth(): Promise<{
  healthy: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  const recentFailedCrons = await prisma.cronLog.count({
    where: {
      executedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      status: "FAILED",
    },
  });

  if (recentFailedCrons > 5) {
    issues.push(
      `High number of failed cron jobs in last 24h: ${recentFailedCrons}`
    );
  }

  const stuckCoolingPeriods = await prisma.user.count({
    where: {
      isInCoolingPeriod: true,
      coolingPeriodEndsAt: {
        lt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
    },
  });

  if (stuckCoolingPeriods > 0) {
    issues.push(
      `${stuckCoolingPeriods} users stuck in cooling period for >48h`
    );
  }

  const orphanedSessions = await prisma.reviewSession.count({
    where: {
      sessionEndedAt: null,
      createdAt: {
        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  if (orphanedSessions > 10) {
    issues.push(`${orphanedSessions} orphaned sessions older than 7 days`);
  }

  return {
    healthy: issues.length === 0,
    issues,
  };
}

export async function monitorSessionServiceHealth(): Promise<{
  status: "healthy" | "degraded" | "critical";
  metrics: {
    activeSessions: number;
    activeCoolingPeriods: number;
    avgSessionDuration: number;
    failedSessionCreations: number;
  };
}> {
  const [activeSessions, activeCoolingPeriods] = await Promise.all([
    prisma.reviewSession.count({
      where: {
        sessionEndedAt: null,
      },
    }),
    prisma.user.count({
      where: {
        isInCoolingPeriod: true,
      },
    }),
  ]);

  const completedSessions = await prisma.reviewSession.findMany({
    where: {
      sessionEndedAt: {
        not: null,
      },
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    select: {
      sessionStartedAt: true,
      sessionEndedAt: true,
    },
  });

  const avgSessionDuration =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, session) => {
          const duration =
            session.sessionEndedAt!.getTime() -
            session.sessionStartedAt.getTime();
          return sum + duration;
        }, 0) /
        completedSessions.length /
        (1000 * 60)
      : 0;

  const recentErrors = await prisma.cronLog.count({
    where: {
      jobName: "hourly-plan-management",
      status: "FAILED",
      executedAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000),
      },
    },
  });

  let status: "healthy" | "degraded" | "critical" = "healthy";

  if (recentErrors > 0 || activeSessions > 1000) {
    status = "degraded";
  }

  if (recentErrors > 3 || activeSessions > 5000) {
    status = "critical";
  }

  return {
    status,
    metrics: {
      activeSessions,
      activeCoolingPeriods,
      avgSessionDuration: Math.round(avgSessionDuration),
      failedSessionCreations: recentErrors,
    },
  };
}
