import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/payment/stripe-client";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Missing subscriptionId" },
        { status: 400 },
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      select: { userId: true, id: true },
    });

    if (!subscription || subscription.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reactivate subscription error:", error);
    return NextResponse.json(
      { error: "Failed to reactivate subscription" },
      { status: 500 },
    );
  }
}
