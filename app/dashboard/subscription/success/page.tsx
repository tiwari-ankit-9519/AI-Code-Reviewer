import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { stripe } from "@/lib/payment/stripe-client";
import { prisma } from "@/lib/prisma";
import {
  SubscriptionTier,
  SubscriptionStatus,
  PaymentProvider,
} from "@prisma/client";

async function processCheckoutSession(sessionId: string, userId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { processed: false, reason: "payment_not_completed" };
    }

    // Get subscription ID as string (Stripe can return object or string)
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      return { processed: false, reason: "no_subscription_id" };
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        stripeSubscriptionId: subscriptionId,
      },
    });

    if (existingSubscription) {
      return { processed: true, reason: "already_exists" };
    }

    const tier = (session.metadata?.tier || "HERO") as SubscriptionTier;

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionStartDate: new Date(),
        stripeCustomerId: session.customer as string,
      },
    });

    await prisma.subscription.create({
      data: {
        userId,
        tier,
        status: SubscriptionStatus.ACTIVE,
        paymentProvider: PaymentProvider.STRIPE,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscriptionId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: session.amount_total || 0,
        currency: session.currency || "inr",
      },
    });

    return { processed: true, reason: "success" };
  } catch (error) {
    console.error("Checkout session processing error:", error);
    return { processed: false, reason: "error", error };
  }
}

async function SuccessPageContent({ sessionId }: { sessionId?: string }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  let processingResult = null;

  if (sessionId) {
    processingResult = await processCheckoutSession(sessionId, session.user.id);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Card className="max-w-2xl w-full border-2 border-green-200 dark:border-green-800 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-4xl font-black mb-2 bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Payment Successful! 🎉
            </CardTitle>
            <CardDescription className="text-lg">
              Welcome to your upgraded experience
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {processingResult?.processed && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {processingResult.reason === "already_exists"
                  ? "Subscription already activated via webhook"
                  : "Subscription activated successfully"}
              </p>
            </div>
          )}

          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              What&apos;s Next?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold">
                    Your subscription is now active
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start enjoying unlimited code reviews and advanced features
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold">Confirmation email sent</p>
                  <p className="text-sm text-muted-foreground">
                    Check your inbox for subscription details and receipt
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold">Ready to submit code</p>
                  <p className="text-sm text-muted-foreground">
                    Head to your dashboard to start your first review
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3">
              🚀 You Now Have Access To:
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Unlimited submissions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Advanced security checks</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Performance analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Export reports (PDF)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">API access</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild className="flex-1" size="lg">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/dashboard/subscription">
                View Subscription Details
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                Contact our support team
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessPageContent sessionId={params.session_id} />
    </Suspense>
  );
}
