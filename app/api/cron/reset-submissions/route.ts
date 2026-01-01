import { NextResponse } from "next/server";
import { resetAllUsers } from "@/lib/subscription/reset-service";
import { logCronExecution } from "@/lib/cron/logger";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const result = await resetAllUsers();

    await logCronExecution(
      "reset-submissions",
      {
        resetCount: result.resetCount,
        message: result.message,
      },
      startTime
    );

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await logCronExecution(
      "reset-submissions",
      {
        resetCount: 0,
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
