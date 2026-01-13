// app/dashboard/admin/users/session-analytics/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSessionAnalytics } from "@/lib/actions/admin-session-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Activity, Clock, TrendingUp } from "lucide-react";

export default async function SessionAnalyticsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const analytics = await getSessionAnalytics(30);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "STARTER":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/50";
      case "HERO":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/50";
      case "LEGEND":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/50";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 mb-2">
          <BarChart3 className="h-10 w-10" />
          Session Analytics
        </h1>
        <p className="text-muted-foreground">
          Track review sessions and cooling periods across all tiers (Last{" "}
          {analytics.period.days} days)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {analytics.tierStats.map((stat) => (
          <Card key={stat.tier} className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{stat.tier} Tier</CardTitle>
                <Badge className={`${getTierColor(stat.tier)} border-2`}>
                  {stat.sessions.activeSessions} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-muted-foreground uppercase">
                    Sessions
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Sessions</span>
                    <span className="font-bold">
                      {stat.sessions.totalSessions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Reviews/Session</span>
                    <span className="font-bold">
                      {stat.sessions.avgReviewsPerSession}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <span className="font-bold">
                      {stat.sessions.completionRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-muted-foreground uppercase">
                    Cooling Periods
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Entered</span>
                    <span className="font-bold">
                      {stat.coolingPeriods.totalCoolingPeriods}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Currently Active</span>
                    <span className="font-bold">
                      {stat.coolingPeriods.activeNow}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Duration</span>
                    <span className="font-bold">
                      {stat.coolingPeriods.avgDurationHours}h
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Session Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recentEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No session events yet
              </p>
            ) : (
              analytics.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="font-mono">
                      {event.action.replace(/_/g, " ")}
                    </Badge>
                    <div>
                      <p className="font-semibold">{event.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={getTierColor(event.user.subscriptionTier)}
                    >
                      {event.user.subscriptionTier}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
