import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { TIER_CONFIG } from "@/lib/subscription/tier-config";
import { CheckoutButton } from "@/components/pricing/checkout-button";

export default async function PricingPage() {
  const session = await auth();

  let user = null;
  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      redirect("/login");
    }
  }

  const plans = [
    {
      tier: "STARTER" as const,
      name: TIER_CONFIG.STARTER.name,
      description: TIER_CONFIG.STARTER.description,
      price: TIER_CONFIG.STARTER.priceDisplay,
      period: "/forever",
      icon: Shield,
      features: TIER_CONFIG.STARTER.features,
      cta: "Current Plan",
      highlighted: false,
      badge: null,
    },
    {
      tier: "HERO" as const,
      name: TIER_CONFIG.HERO.name,
      description: TIER_CONFIG.HERO.description,
      price: TIER_CONFIG.HERO.priceDisplay,
      period: "/month",
      icon: Zap,
      features: TIER_CONFIG.HERO.features,
      cta: "Start 7-Day Trial",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      tier: "LEGEND" as const,
      name: TIER_CONFIG.LEGEND.name,
      description: TIER_CONFIG.LEGEND.description,
      price: TIER_CONFIG.LEGEND.priceDisplay,
      period: "",
      icon: Crown,
      features: TIER_CONFIG.LEGEND.features,
      cta: "Contact Sales",
      highlighted: false,
      badge: "Enterprise",
    },
  ];

  const currentTier = user?.subscriptionTier || "STARTER";
  const isTrialing = user?.subscriptionStatus === "TRIALING";

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Back Link for authenticated users */}
          {user && (
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="gap-2 mb-8 group hover:gap-3 transition-all duration-300"
              >
                <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Button>
            </Link>
          )}

          {/* Title */}
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Pricing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All plans include 7-day free trial • No credit card required
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = currentTier === plan.tier;
              const canUpgrade =
                (currentTier === "STARTER" && plan.tier === "HERO") ||
                (currentTier === "STARTER" && plan.tier === "LEGEND") ||
                (currentTier === "HERO" && plan.tier === "LEGEND");

              return (
                <Card
                  key={plan.tier}
                  className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.highlighted
                      ? "border-primary shadow-lg scale-105 hover:scale-110"
                      : "hover:border-primary/50 hover:scale-105"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge className="shadow-lg">{plan.badge}</Badge>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge variant="secondary" className="shadow-lg">
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-8 pt-8">
                    <div className="space-y-6">
                      {/* Icon & Name */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-xl ${
                            plan.highlighted ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <Icon
                            className={`h-8 w-8 ${
                              plan.highlighted
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {plan.description}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features */}
                    <ul className="space-y-3 min-h-[200px]">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    {plan.tier === "STARTER" && (
                      <Link href={user ? "/dashboard" : "/register"}>
                        <Button
                          variant="outline"
                          className="w-full"
                          size="lg"
                          disabled={isCurrent}
                        >
                          {user ? "Current Plan" : "Get Started Free"}
                        </Button>
                      </Link>
                    )}

                    {plan.tier === "HERO" && (
                      <>
                        {!user ? (
                          <Link href="/register">
                            <Button
                              className="w-full gap-2 group hover:gap-3 transition-all"
                              size="lg"
                            >
                              {plan.cta}
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        ) : isCurrent && !isTrialing ? (
                          <Button
                            variant="secondary"
                            className="w-full"
                            size="lg"
                            disabled
                          >
                            Current Plan
                          </Button>
                        ) : canUpgrade ? (
                          <CheckoutButton tier="HERO" />
                        ) : (
                          <Link href="/dashboard/subscription">
                            <Button
                              variant="outline"
                              className="w-full"
                              size="lg"
                            >
                              Manage Subscription
                            </Button>
                          </Link>
                        )}
                      </>
                    )}

                    {plan.tier === "LEGEND" && (
                      <Link href="/contact-sales">
                        <Button
                          variant="outline"
                          className="w-full gap-2 group hover:gap-3 transition-all"
                          size="lg"
                        >
                          {plan.cta}
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Trial Info */}
          <Card className="mt-12 max-w-3xl mx-auto border-2 border-primary/50 bg-primary/5">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                Try Hero Free for 7 Days
              </h3>
              <p className="text-muted-foreground mb-6">
                Start your free trial today. No credit card required. Cancel
                anytime during the trial period.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold">Unlimited Reviews</div>
                  <div className="text-muted-foreground">
                    No submission limits during trial
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold">Full Feature Access</div>
                  <div className="text-muted-foreground">
                    All Hero features included
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold">No Commitment</div>
                  <div className="text-muted-foreground">
                    Cancel anytime, no questions asked
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Have questions? We&apos;ve got answers.
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  How does the 7-day trial work?
                </h3>
                <p className="text-sm text-muted-foreground">
                  You get full access to all Hero features for 7 days,
                  completely free. No credit card required. After the trial,
                  you&apos;ll automatically move to the Starter plan unless you
                  upgrade.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  Can I cancel my subscription anytime?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You can cancel your subscription at any time from your
                  account settings. You&apos;ll continue to have access until
                  the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards and debit cards through our
                  secure payment processor, Stripe.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  Can I upgrade or downgrade my plan?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. When
                  upgrading, you&apos;ll get immediate access to new features.
                  When downgrading, the change takes effect at the end of your
                  current billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">
                  What&apos;s included in the Legend plan?
                </h3>
                <p className="text-sm text-muted-foreground">
                  The Legend plan is designed for teams and enterprises. It
                  includes everything in Hero plus dedicated support, custom
                  integrations, SLA guarantees, and unlimited file sizes.
                  Contact our sales team for custom pricing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-2 border-primary bg-linear-to-br from-primary/10 via-primary/5 to-background">
            <CardContent className="p-12">
              <Zap className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">
                Ready to Level Up Your Code?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of developers using AI-powered code reviews
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={user ? "/dashboard/subscription" : "/register"}>
                  <Button
                    size="lg"
                    className="gap-2 group hover:gap-3 transition-all"
                  >
                    {user ? "Upgrade Now" : "Start Free Trial"}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact-sales">
                  <Button variant="outline" size="lg">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
