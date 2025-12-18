import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkTrialStatus } from "@/lib/subscription/subscription-utils";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trialStatus = await checkTrialStatus(session.user.id);

    return NextResponse.json(trialStatus, { status: 200 });
  } catch (error) {
    console.error("Trial status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trial status" },
      { status: 500 }
    );
  }
}
