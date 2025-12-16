import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const expiredTrials = await prisma.user.findMany({
    where: {
      subscriptionStatus: "TRIALING",
      trialEndsAt: { lte: now },
    },
    select: {
      id: true,
      email: true,
      name: true,
      trialEndsAt: true,
    },
  });

  for (const user of expiredTrials) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionTier: "STARTER",
          subscriptionStatus: "ACTIVE",
          trialEndsAt: null,
          isTrialUsed: true,
          monthlySubmissionCount: 0,
          submissionLimitNotified: false,
        },
      }),

      prisma.subscriptionHistory.create({
        data: {
          userId: user.id,
          action: "TRIAL_ENDED",
          fromTier: "HERO",
          toTier: "STARTER",
          reason: "trial_expired",
          metadata: {
            expiredAt: now.toISOString(),
          },
        },
      }),
    ]);

    console.log(`Trial expired for user ${user.email}`);
  }

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const endingSoon = await prisma.user.findMany({
    where: {
      subscriptionStatus: "TRIALING",
      trialEndsAt: {
        gte: now,
        lte: tomorrow,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      trialEndsAt: true,
    },
  });

  console.log(`Found ${expiredTrials.length} expired trials`);
  console.log(`Found ${endingSoon.length} trials ending soon`);

  return NextResponse.json({
    success: true,
    expired: expiredTrials.length,
    reminded: endingSoon.length,
    expiredUsers: expiredTrials.map((u) => u.email),
    remindedUsers: endingSoon.map((u) => u.email),
    timestamp: now.toISOString(),
  });
}
