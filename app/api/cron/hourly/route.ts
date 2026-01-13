import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  logCronJobExecution,
  logCoolingPeriodExpiration,
} from "@/lib/monitoring/session-logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const results = {
    coolingPeriodsCleared: 0,
    sessionsEnded: 0,
    orphanedSessionsCleaned: 0,
    errors: [] as string[],
  };

  try {
    const now = new Date();

    const expiredCoolingPeriods = await prisma.user.findMany({
      where: {
        isInCoolingPeriod: true,
        coolingPeriodEndsAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (expiredCoolingPeriods.length > 0) {
      await prisma.user.updateMany({
        where: {
          isInCoolingPeriod: true,
          coolingPeriodEndsAt: {
            lte: now,
          },
        },
        data: {
          isInCoolingPeriod: false,
          coolingPeriodEndsAt: null,
        },
      });

      results.coolingPeriodsCleared = expiredCoolingPeriods.length;
      console.log(
        `[HOURLY] Cleared ${expiredCoolingPeriods.length} expired cooling periods`
      );

      for (const user of expiredCoolingPeriods) {
        await logCoolingPeriodExpiration(user.id, true);
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Cooling period cleanup failed: ${errorMessage}`);
    console.error("Cooling period cleanup error:", error);
  }

  try {
    const now = new Date();

    const expiredSessions = await prisma.reviewSession.findMany({
      where: {
        isInCoolingPeriod: true,
        coolingPeriodEndsAt: {
          not: null,
          lte: now,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (expiredSessions.length > 0) {
      await prisma.reviewSession.updateMany({
        where: {
          id: {
            in: expiredSessions.map((s) => s.id),
          },
        },
        data: {
          isInCoolingPeriod: false,
        },
      });

      results.sessionsEnded = expiredSessions.length;
      console.log(`[HOURLY] Ended ${expiredSessions.length} expired sessions`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Session expiration failed: ${errorMessage}`);
    console.error("Session expiration error:", error);
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldSessions = await prisma.reviewSession.findMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
      select: {
        id: true,
      },
    });

    if (oldSessions.length > 0) {
      await prisma.reviewSession.deleteMany({
        where: {
          id: {
            in: oldSessions.map((s) => s.id),
          },
        },
      });

      results.orphanedSessionsCleaned = oldSessions.length;
      console.log(
        `[HOURLY] Cleaned ${oldSessions.length} old sessions (30+ days)`
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Old session cleanup failed: ${errorMessage}`);
    console.error("Old session cleanup error:", error);
  }

  await logCronJobExecution(
    "hourly-plan-management",
    Date.now() - startTime,
    results.errors.length === 0,
    results
  );

  return NextResponse.json({
    success: results.errors.length === 0,
    ...results,
    timestamp: new Date().toISOString(),
  });
}
