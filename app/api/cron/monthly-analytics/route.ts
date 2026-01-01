import { NextResponse } from "next/server";
import { runMonthlyTasks } from "@/lib/analytics/monthly-tasks";
import { logCronExecution } from "@/lib/cron/logger";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const results = await runMonthlyTasks();

    await logCronExecution(
      "monthly-analytics",
      {
        snapshotGenerated: results.snapshotGenerated,
        dataArchived: results.dataArchived,
        period: results.snapshot?.period || null,
        errors: results.errors,
      },
      startTime
    );

    return NextResponse.json({
      success: results.errors.length === 0,
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await logCronExecution(
      "monthly-analytics",
      {
        errors: [errorMessage],
      },
      startTime
    );

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
