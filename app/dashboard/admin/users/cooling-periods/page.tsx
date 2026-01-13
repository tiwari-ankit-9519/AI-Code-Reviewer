// app/dashboard/admin/users/cooling-periods/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, Users, AlertCircle } from "lucide-react";
import CoolingPeriodResetButton from "@/components/admin/cooling-period-reset-button";

export const dynamic = "force-dynamic";

async function getUsersInCoolingPeriod() {
  const users = await prisma.user.findMany({
    where: {
      isInCoolingPeriod: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      coolingPeriodEndsAt: true,
      reviewSessions: {
        where: {
          isInCoolingPeriod: true,
        },
        orderBy: {
          sessionStartedAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          reviewsInSession: true,
          maxReviewsPerSession: true,
          coolingPeriodHours: true,
          sessionStartedAt: true,
        },
      },
    },
    orderBy: {
      coolingPeriodEndsAt: "asc",
    },
  });

  return users;
}

export default async function CoolingPeriodsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const usersInCooling = await getUsersInCoolingPeriod();

  const getHoursRemaining = (endsAt: Date | null) => {
    if (!endsAt) return 0;
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "HERO":
        return "bg-purple-500/10 text-purple-600 border-purple-500/50";
      case "LEGEND":
        return "bg-orange-500/10 text-orange-600 border-orange-500/50";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/50";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 mb-2">
          <Timer className="h-10 w-10" />
          Cooling Period Management
        </h1>
        <p className="text-muted-foreground">
          View and manage users currently in cooling periods
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total in Cooling
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersInCooling.length}</div>
            <p className="text-xs text-muted-foreground">
              Active cooling periods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                usersInCooling.filter(
                  (u) => getHoursRemaining(u.coolingPeriodEndsAt) <= 6
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Within 6 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usersInCooling.length > 0
                ? Math.round(
                    usersInCooling.reduce(
                      (sum, u) =>
                        sum + (u.reviewSessions[0]?.coolingPeriodHours || 0),
                      0
                    ) / usersInCooling.length
                  )
                : 0}
              h
            </div>
            <p className="text-xs text-muted-foreground">
              Average cooling time
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users in Cooling Period</CardTitle>
        </CardHeader>
        <CardContent>
          {usersInCooling.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Timer className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">
                No users in cooling period
              </p>
              <p className="text-sm">All users are currently active</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usersInCooling.map((user) => {
                const hoursRemaining = getHoursRemaining(
                  user.coolingPeriodEndsAt
                );
                const session = user.reviewSessions[0];

                return (
                  <div
                    key={user.id}
                    className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <Badge
                            className={getTierColor(user.subscriptionTier)}
                          >
                            {user.subscriptionTier}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <CoolingPeriodResetButton
                        userId={user.id}
                        userName={user.name || user.email}
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-muted-foreground mb-1">
                          Time Remaining
                        </p>
                        <p className="font-bold text-lg">{hoursRemaining}h</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-muted-foreground mb-1">
                          Reviews Done
                        </p>
                        <p className="font-bold text-lg">
                          {session?.reviewsInSession || 0} /{" "}
                          {session?.maxReviewsPerSession || 0}
                        </p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-muted-foreground mb-1">
                          Cooling Duration
                        </p>
                        <p className="font-bold text-lg">
                          {session?.coolingPeriodHours || 0}h
                        </p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-muted-foreground mb-1">Ends At</p>
                        <p className="font-bold text-sm">
                          {user.coolingPeriodEndsAt
                            ? new Date(
                                user.coolingPeriodEndsAt
                              ).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
