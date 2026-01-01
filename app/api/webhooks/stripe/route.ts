import { NextResponse } from "next/server";
import { stripe, STRIPE_CONFIG } from "@/lib/payment/stripe-client";
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handleChargeRefunded,
} from "@/lib/payment/webhook-handlers";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted({
          id: session.id,
          customer: session.customer as string,
          subscription: session.subscription as string,
          amount_total: session.amount_total || 0,
          metadata: {
            userId: session.metadata?.userId || "",
            tier: session.metadata?.tier || "",
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionData = subscription as unknown as {
          id: string;
          customer: string;
          status: string;
          items: {
            data: Array<{ price: { id: string; unit_amount: number | null } }>;
          };
          current_period_start: number;
          current_period_end: number;
          cancel_at_period_end: boolean;
          canceled_at: number | null;
          metadata?: { userId?: string; tier?: string };
        };

        await handleSubscriptionUpdated({
          id: subscriptionData.id,
          customer: subscriptionData.customer,
          status: subscriptionData.status,
          items: {
            data: subscriptionData.items.data.map((item) => ({
              price: {
                id: item.price.id,
                unit_amount: item.price.unit_amount || 0,
              },
            })),
          },
          current_period_start: subscriptionData.current_period_start,
          current_period_end: subscriptionData.current_period_end,
          cancel_at_period_end: subscriptionData.cancel_at_period_end,
          canceled_at: subscriptionData.canceled_at,
          metadata: {
            userId: subscriptionData.metadata?.userId,
            tier: subscriptionData.metadata?.tier,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted({
          id: subscription.id,
          customer: subscription.customer as string,
          metadata: {
            userId: subscription.metadata?.userId,
            tier: subscription.metadata?.tier,
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceData = invoice as unknown as {
          id: string;
          customer: string;
          subscription: string;
          amount_paid: number;
          billing_reason: string | null;
        };

        await handleInvoicePaid({
          id: invoiceData.id,
          customer: invoiceData.customer,
          subscription: invoiceData.subscription || "",
          amount_paid: invoiceData.amount_paid,
          billing_reason: invoiceData.billing_reason || "",
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceData = invoice as unknown as {
          id: string;
          customer: string;
          subscription: string;
          amount_due: number;
          last_finalization_error?: { message: string };
        };

        await handleInvoicePaymentFailed({
          id: invoiceData.id,
          customer: invoiceData.customer,
          subscription: invoiceData.subscription || "",
          amount_due: invoiceData.amount_due,
          last_payment_error: invoiceData.last_finalization_error
            ? { message: invoiceData.last_finalization_error.message || "" }
            : undefined,
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded({
          id: charge.id,
          customer: charge.customer as string,
          amount_refunded: charge.amount_refunded,
          refunds: {
            data:
              charge.refunds?.data.map((refund) => ({
                reason: refund.reason,
              })) || [],
          },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, eventType: event.type });
  } catch (err) {
    console.error("Webhook processing failed:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
