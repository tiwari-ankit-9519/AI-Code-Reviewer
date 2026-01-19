import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { CancelSubscriptionButton } from "@/components/subscription/cancel-subscription-button";
import { formatDistanceToNow } from "date-fns";
import { PaymentHistory } from "@/components/subscription/payment-history";

export default async function SubscriptionPage() {
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
        "Dedicated support (4-8h)",
        "Advanced analytics",
        "Custom integrations",
        "Team collaboration",
        "SLA guarantee",
      ],
      current: user.subscriptionTier === "LEGEND",
      isEnterprise: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <CreditCard className="h-10 w-10" />
          Subscription
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing
        </p>
      </div>

      {hasActiveSubscription && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Your active plan details</CardDescription>
              </div>
              <Badge variant="default" className="text-base px-4 py-1">
                {user.subscriptionTier}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={isCanceled ? "destructive" : "default"}>
                  {isCanceled ? "Canceling" : "Active"}
                </Badge>
              </div>
              {activeSubscription.currentPeriodStart && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Started</p>
                  <p className="font-semibold">
                    {formatDistanceToNow(
                      new Date(activeSubscription.currentPeriodStart),
                      {
                        addSuffix: true,
                      },
                    )}
                  </p>
                </div>
              )}
              {activeSubscription.currentPeriodEnd && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {isCanceled ? "Expires" : "Renews"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="font-semibold">
                      {formatDistanceToNow(
                        new Date(activeSubscription.currentPeriodEnd),
                        {
                          addSuffix: true,
                        },
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {user.subscriptionTier === "HERO" &&
              activeSubscription.stripeSubscriptionId && (
                <div className="pt-4 border-t">
                  <CancelSubscriptionButton
                    subscriptionId={activeSubscription.stripeSubscriptionId}
                    isCanceled={isCanceled}
                  />
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {isTrialing && user.trialEndsAt && (
        <Card className="border-yellow-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Trial Period</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your trial ends{" "}
              <span className="font-semibold text-foreground">
                {formatDistanceToNow(new Date(user.trialEndsAt), {
                  addSuffix: true,
                })}
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
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
                      <form action="/api/checkout" method="POST">
                        <input
                          type="hidden"
                          name="priceId"
                          value={plan.priceId}
                        />
                        <input type="hidden" name="tier" value={plan.name} />
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
