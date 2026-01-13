// lib/monitoring/session-logger.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type LogLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";

interface SessionLogEntry {
  level: LogLevel;
  event: string;
  userId?: string;
  sessionId?: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export async function logSessionEvent(entry: SessionLogEntry): Promise<void> {
  const logMessage = `[${entry.level}] ${entry.event} - User: ${
    entry.userId || "N/A"
  } - Session: ${entry.sessionId || "N/A"}`;

  console.log(logMessage, entry.details);

  if (entry.level === "ERROR" || entry.level === "CRITICAL") {
    console.error(logMessage, entry.details);
  }
}

export async function logCoolingPeriodExpiration(
  userId: string,
  success: boolean,
  error?: string
): Promise<void> {
  await logSessionEvent({
    level: success ? "INFO" : "ERROR",
    event: "COOLING_PERIOD_EXPIRATION",
    userId,
    details: {
      success,
      error: error || null,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  });
}

export async function logSessionCreationFailure(
  userId: string,
  error: Error
): Promise<void> {
  await logSessionEvent({
    level: "ERROR",
    event: "SESSION_CREATION_FAILED",
    userId,
    details: {
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  });
}

export async function logConcurrentSubmissionAttempt(
  userId: string,
  sessionId: string,
  blocked: boolean
): Promise<void> {
  await logSessionEvent({
    level: blocked ? "WARN" : "INFO",
    event: "CONCURRENT_SUBMISSION_ATTEMPT",
    userId,
    sessionId,
    details: {
      blocked,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  });
}

export async function logTierChangeWithSession(
  userId: string,
  oldTier: string,
  newTier: string,
  sessionId?: string
): Promise<void> {
  await logSessionEvent({
    level: "INFO",
    event: "TIER_CHANGE_WITH_ACTIVE_SESSION",
    userId,
    sessionId,
    details: {
      oldTier,
      newTier,
      hadActiveSession: !!sessionId,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  });
}

export async function logCronJobExecution(
  jobName: string,
  duration: number,
  success: boolean,
  results: Record<string, unknown>
): Promise<void> {
  await prisma.cronLog.create({
    data: {
      jobName,
      status: success ? "SUCCESS" : "FAILED",
      results: results as Prisma.JsonObject,
      duration,
      executedAt: new Date(),
    },
  });

  await logSessionEvent({
    level: success ? "INFO" : "ERROR",
    event: "CRON_JOB_EXECUTED",
    details: {
      jobName,
      duration,
      results,
      success,
    },
    timestamp: new Date(),
  });
}

export async function logDatabaseQueryPerformance(
  queryName: string,
  duration: number,
  threshold: number = 1000
): Promise<void> {
  if (duration > threshold) {
    await logSessionEvent({
      level: "WARN",
      event: "SLOW_DATABASE_QUERY",
      details: {
        queryName,
        duration,
        threshold,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    });
  }
}

export async function logSessionLimitReachedWithoutCooling(
  userId: string,
  sessionId: string,
  tier: string
): Promise<void> {
  await logSessionEvent({
    level: "CRITICAL",
    event: "SESSION_LIMIT_REACHED_NO_COOLING",
    userId,
    sessionId,
    details: {
      tier,
      message: "Session limit reached but cooling period not triggered",
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  });
}

export async function logOrphanedSessionDetected(
  sessionId: string,
  userId: string,
  reason: string
): Promise<void> {
  await logSessionEvent({
    level: "WARN",
    event: "ORPHANED_SESSION_DETECTED",
    userId,
    sessionId,
    details: {
      reason,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  });
}
