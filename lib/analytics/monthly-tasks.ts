import { generateMonthlySnapshot } from "@/lib/analytics/generate-snapshot";
import { cleanupOldAnalytics, cleanupOldCronLogs } from "@/lib/cron/tasks";

export async function generateMonthlyAnalyticsSnapshot() {
  const now = new Date();
  const lastMonth = {
    year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
    month: now.getMonth() === 0 ? 12 : now.getMonth(),
  };

  const snapshot = await generateMonthlySnapshot(
    lastMonth.year,
    lastMonth.month
  );

  return {
    snapshot,
    period: snapshot.period,
    success: true,
  };
}

export async function archiveOldData() {
  const [analyticsArchived, logsArchived] = await Promise.all([
    cleanupOldAnalytics(365),
    cleanupOldCronLogs(90),
  ]);

  return {
    analyticsArchived,
    logsArchived,
    success: true,
  };
}

export async function runMonthlyTasks() {
  const results = {
    snapshotGenerated: false,
    dataArchived: false,
    snapshot: null as Awaited<
      ReturnType<typeof generateMonthlySnapshot>
    > | null,
    errors: [] as string[],
  };

  try {
    const snapshot = await generateMonthlySnapshot(
      new Date().getMonth() === 0
        ? new Date().getFullYear() - 1
        : new Date().getFullYear(),
      new Date().getMonth() === 0 ? 12 : new Date().getMonth()
    );
    results.snapshotGenerated = true;
    results.snapshot = snapshot;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Snapshot generation failed: ${errorMessage}`);
    console.error("Monthly snapshot error:", error);
  }

  try {
    await archiveOldData();
    results.dataArchived = true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Data archival failed: ${errorMessage}`);
    console.error("Data archival error:", error);
  }

  return results;
}
