import { prisma } from "@/lib/prisma";
import { getMetricsSummary } from "@/lib/analytics/metrics-calculator";
import StatCard from "@/components/admin/StatCard";
import RecentActivity from "@/components/admin/RecentActivity";
import AlertsPanel from "@/components/admin/AlertsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

async function getAdminStats() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const metrics = await getMetricsSummary();

  const [
    totalUsers,
    activeSubscriptions,
    trialsStarted,
    trialsConverted,
    failedPayments,
    expiringTrials,
    totalCancelled,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        subscriptionStatus: "ACTIVE",
        subscriptionTier: { in: ["HERO", "LEGEND"] },
        stripeCustomerId: { not: null },
      },
    }),
    prisma.user.count({
      where: {
        subscriptionStatus: "TRIALING",
        isTrialUsed: false,
      },
    }),
    prisma.subscriptionHistory.count({
      where: {
        action: "TRIAL_CONVERTED",
        createdAt: { gte: lastMonth },
      },
    }),
    prisma.user.count({
      where: {
        subscriptionStatus: "PAST_DUE",
      },
    }),
    prisma.user.count({
      where: {
        subscriptionStatus: "TRIALING",
        trialEndsAt: {
          gte: now,
          lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.user.count({
      where: {
        subscriptionStatus: "CANCELLED",
      },
    }),
  ]);

  return {
    mrr: metrics.mrr,
    mrrGrowth: metrics.revenueGrowth,
    activeSubscriptions,
    subscriptionGrowth: metrics.userGrowth,
    trialConversion: metrics.trialConversion,
    conversionTrend: 0,
    churnRate: metrics.churnRate,
    churnTrend: 0,
    failedPayments,
    expiringTrials,
    totalUsers,
    trialsStarted,
    trialsConverted,
    totalCancelled,
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your platform metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={`₹${stats.mrr.toLocaleString("en-IN")}`}
          icon="revenue"
          trend={stats.mrrGrowth}
          trendLabel={`${
            stats.mrrGrowth >= 0 ? "+" : ""
          }${stats.mrrGrowth.toFixed(1)}%`}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions.toString()}
          icon="users"
          trend={stats.subscriptionGrowth}
          trendLabel={`${
            stats.subscriptionGrowth >= 0 ? "+" : ""
          }${stats.subscriptionGrowth.toFixed(1)}%`}
        />
        <StatCard
          title="Trial Conversion Rate"
          value={`${stats.trialConversion.toFixed(1)}%`}
          icon="target"
          trend={stats.conversionTrend}
          trendLabel={`${stats.trialsConverted}/${stats.trialsStarted} converted`}
        />
        <StatCard
          title="Churn Rate"
          value={`${stats.churnRate.toFixed(1)}%`}
          icon="churn"
          trend={-stats.churnRate}
          trendLabel={`${stats.totalCancelled} total cancelled`}
        />
      </div>

      {/* Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity limit={5} />
          </CardContent>
        </Card>

        <AlertsPanel
          failedPayments={stats.failedPayments}
          expiringTrials={stats.expiringTrials}
        />
      </div>
    </div>
  );
}
