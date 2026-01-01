import { NextResponse } from "next/server";
import { resetAllUsers } from "@/lib/subscription/reset-service";
import { runMonthlyTasks } from "@/lib/analytics/monthly-tasks";
import { emailMonthlyReport } from "@/lib/email/admin-report";
import { logCronExecution } from "@/lib/cron/logger";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const results = {
    resetCount: 0,
    snapshotGenerated: false,
    dataArchived: false,
    reportEmailed: false,
    errors: [] as string[],
  };

  try {
    const resetResult = await resetAllUsers();
    results.resetCount = resetResult.resetCount;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Submission reset failed: ${errorMessage}`);
    console.error("Submission reset error:", error);
  }

  try {
    const monthlyTasksResult = await runMonthlyTasks();
    results.snapshotGenerated = monthlyTasksResult.snapshotGenerated;
    results.dataArchived = monthlyTasksResult.dataArchived;

    if (monthlyTasksResult.snapshot && process.env.ADMIN_EMAIL) {
      try {
        await emailMonthlyReport(
          process.env.ADMIN_EMAIL,
          monthlyTasksResult.snapshot
        );
        results.reportEmailed = true;
        console.log(`Monthly report emailed to ${process.env.ADMIN_EMAIL}`);
      } catch (emailError) {
        const emailErrorMessage =
          emailError instanceof Error ? emailError.message : "Unknown error";
        results.errors.push(`Email report failed: ${emailErrorMessage}`);
        console.error("Email report error:", emailError);
      }
    }

    if (monthlyTasksResult.errors.length > 0) {
      results.errors.push(...monthlyTasksResult.errors);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    results.errors.push(`Monthly tasks failed: ${errorMessage}`);
    console.error("Monthly tasks error:", error);
  }

  await logCronExecution("monthly-tasks", results, startTime);

  return NextResponse.json({
    success: results.errors.length === 0,
    ...results,
    timestamp: new Date().toISOString(),
  });
}
