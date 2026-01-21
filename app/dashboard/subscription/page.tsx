import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { CancelSubscriptionButton } from "@/components/subscription/cancel-subscription-button";
import { formatDistanceToNow } from "date-fns";
import { PaymentHistory } from "@/components/subscription/payment-history";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { SubscriptionSuccessHandler } from "@/components/subscription/subscription-success-handler";

export default async function SubscriptionPage(props: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      trialEndsAt: true,
      subscriptions: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const activeSubscription = user.subscriptions[0];
  const hasActiveSubscription =
    user.subscriptionStatus === "ACTIVE" && activeSubscription;
  const isTrialing = user.subscriptionStatus === "TRIALING";
  const isCanceled = activeSubscription?.cancelAtPeriodEnd || false;

  const plans = [
    {
      name: "STARTER",
      price: "Free",
      period: "",
      features: [
        "5 submissions per month",
        "50KB file size limit",
        "Basic code analysis",
        "6 security checks",
        "5 performance checks",
        "Community support",
      ],
      current: user.subscriptionTier === "STARTER",
    },
    {
      name: "HERO",
      price: "₹2999",
      period: "/month",
      features: [
        "50 submissions per month",
        "100KB file size limit",
        "Advanced code analysis",
        "13 security checks",
        "13 performance checks",
        "Priority support (24h)",
        "Export reports (JSON, MD, PDF)",
      ],
      current: user.subscriptionTier === "HERO",
      priceId: process.env.STRIPE_HERO_PRICE_ID,
    },
    {
      name: "LEGEND",
      price: "Custom",
      period: "",
      features: [
        "Unlimited submissions",
        "500KB file size limit",
        "Enterprise analysis",
        "20 security checks",
        "20 performance checks",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantees",
      ],
      current: user.subscriptionTier === "LEGEND",
      isEnterprise: true,
    },
  ];

  async function handleUpgrade(tier: "HERO") {
    "use server";
    const { url } = await createCheckoutSession(tier);
    redirect(url);
  }

  return (
    <div className="space-y-8">
      <SubscriptionSuccessHandler
        success={searchParams.success === "true"}
        canceled={searchParams.canceled === "true"}
      />

      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Subscription & Billing
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription and view billing details
        </p>
      </div>

      {isTrialing && user.trialEndsAt && (
        <Card className="border-2 border-yellow-500/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Trial Active</h3>
                <p className="text-sm text-muted-foreground">
                  Your Hero trial ends{" "}
                  {formatDistanceToNow(new Date(user.trialEndsAt), {
                    addSuffix: true,
                  })}
                  . Upgrade now to continue with unlimited access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasActiveSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold">{user.subscriptionTier}</p>
              </div>
              <Badge
                variant={
                  isCanceled
                    ? "destructive"
                    : isTrialing
                      ? "secondary"
                      : "default"
                }
              >
                {isCanceled
                  ? "Canceling"
                  : isTrialing
                    ? "Trial"
                    : user.subscriptionStatus}
              </Badge>
            </div>

            {activeSubscription && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Period
                    </p>
                    <p className="text-sm">
                      {new Date(
                        activeSubscription.currentPeriodStart,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        activeSubscription.currentPeriodEnd,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: activeSubscription.currency,
                      }).format(activeSubscription.amount / 100)}
                    </p>
                  </div>
                </div>
              </>
            )}

            {user.subscriptionTier !== "STARTER" && (
              <div className="pt-4">
                <CancelSubscriptionButton isCanceled={isCanceled} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.current ? "border-primary border-2" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.current && <Badge>Current Plan</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {!plan.current && (
                  <div className="pt-4">
                    {plan.isEnterprise ? (
                      <Link href="/contact">
                        <Button className="w-full">Contact Sales</Button>
                      </Link>
                    ) : plan.name === "STARTER" ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <form
                        action={handleUpgrade.bind(null, plan.name as "HERO")}
                      >
                        <Button type="submit" className="w-full">
                          Upgrade to {plan.name}
                        </Button>
                      </form>
                    )}
                  </div>
                )}

                {plan.current && plan.name !== "STARTER" && (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {user.stripeCustomerId && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Payment History</h2>
          <PaymentHistory />
        </div>
      )}

      {!user.stripeCustomerId && (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
            <p className="text-muted-foreground">
              You haven&apos;t made any payments yet. Upgrade to a paid plan to
              see your payment history.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
