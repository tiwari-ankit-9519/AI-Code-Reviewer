"use server";

import { auth } from "@/lib/auth";
import {
  getAllTiersSessionStats,
  getRecentSessionEvents,
} from "@/lib/analytics/session-analytics";

export async function getSessionAnalytics(days: number = 30) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const tierStats = await getAllTiersSessionStats(startDate, endDate);
  const recentEvents = await getRecentSessionEvents(50);

  return {
    tierStats,
    recentEvents,
    period: {
      start: startDate,
      end: endDate,
      days,
    },
  };
}
