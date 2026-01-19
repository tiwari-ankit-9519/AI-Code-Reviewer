// app/api/checkout/route.ts

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
    const formData = await request.formData();
    const priceId = formData.get("priceId") as string;
    const tier = formData.get("tier") as string;

    if (!priceId || !tier) {
      return NextResponse.json(
        { error: "Missing priceId or tier" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true },
    });

    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email || session.user.email || "",
        metadata: {
          userId: session.user.id,
        },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.AUTH_URL}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.AUTH_URL}/dashboard/subscription?canceled=true`,
      metadata: {
        userId: session.user.id,
        tier: tier,
      },
    });

    return NextResponse.redirect(checkoutSession.url!);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
