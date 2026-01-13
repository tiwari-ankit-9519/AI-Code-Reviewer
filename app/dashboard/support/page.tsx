// app/dashboard/support/page.tsx

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  Plus,
  Mail,
  Phone,
} from "lucide-react";

export default async function SupportPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      subscriptionTier: true,
      supportLevel: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const openTicketsCount = await prisma.supportTicket.count({
    where: {
      userId: session.user.id,
      status: {
        in: ["OPEN", "IN_PROGRESS", "WAITING_USER"],
      },
    },
  });

  const supportConfig = {
    STARTER: {
      title: "Community Support",
      description: "Email support with 48-72 hour response time",
      responseTime: "48-72 hours",
      features: [
        "Email support",
        "FAQ & documentation",
        "Community forum access",
      ],
    },
    HERO: {
      title: "Priority Support",
      description: "Priority email support with 24 hour response time",
      responseTime: "24 hours",
      features: [
        "Priority email support",
        "24-hour response time",
        "Advanced troubleshooting",
        "FAQ & documentation",
      ],
    },
    LEGEND: {
      title: "Dedicated Support",
      description: "Dedicated support team with 4-8 hour response time",
      responseTime: "4-8 hours",
      features: [
        "Dedicated support team",
        "4-8 hour response time",
        "Phone & video support",
        "Advanced troubleshooting",
        "Priority queue",
      ],
    },
  };

  const config = supportConfig[user.subscriptionTier];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <LifeBuoy className="h-10 w-10" />
            Support
          </h1>
          <p className="text-muted-foreground mt-2">Get help from our team</p>
        </div>
        <Link href="/dashboard/support/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{config.title}</span>
              <Badge variant="outline">{user.subscriptionTier}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{config.description}</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-semibold">
                  Response Time: {config.responseTime}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {config.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {user.subscriptionTier === "STARTER" && (
              <div className="pt-4">
                <Link href="/pricing">
                  <Button variant="outline" className="w-full">
                    Upgrade for Faster Support
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Your Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Open Tickets
              </span>
              <span className="text-2xl font-bold">{openTicketsCount}</span>
            </div>

            <div className="flex flex-col gap-5">
              <Link href="/dashboard/support/tickets">
                <Button variant="outline" className="w-full">
                  View All Tickets
                </Button>
              </Link>

              <Link href="/dashboard/support/new">
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Ticket
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Other Ways to Get Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-4 p-4 rounded-lg border">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Send us an email directly
                </p>
                <a
                  href={`mailto:${
                    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
                    "support@example.com"
                  }`}
                  className="text-sm text-primary hover:underline"
                >
                  {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
                    "support@example.com"}
                </a>
              </div>
            </div>

            {user.subscriptionTier === "LEGEND" && (
              <div className="flex items-start gap-4 p-4 rounded-lg border">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Call us for immediate assistance
                  </p>
                  <p className="text-sm text-primary font-semibold">
                    Available for Legend tier
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
