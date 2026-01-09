import { prisma } from "@/lib/prisma";
import {
  getMetricsSummary,
  getActiveSubscriptionsByTier,
  getTrialMetrics,
  getSubmissionMetrics,
} from "@/lib/analytics/metrics-calculator";
import MetricsCards from "@/components/admin/MetricsCards";
import RevenueChart from "@/components/admin/RevenueChart";
import TierDistributionChart from "@/components/admin/TierDistributionChart";
import TrialPerformance from "@/components/admin/TrialPerformance";
import SubmissionUsage from "@/components/admin/SubmissionUsage";
import { BarChart3 } from "lucide-react";

async function getRevenueHistory() {
  const snapshots = await prisma.tierUsageAnalytics.findMany({
    orderBy: { periodStart: "desc" },
    take: 12,
    select: {
      periodStart: true,
      mrr: true,
      totalUsers: true,
    },
  });

  return snapshots.reverse();
}

export default async function SubscriptionAnalyticsPage() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [
    metrics,
    tierDistribution,
    revenueHistory,
    trialMetrics,
    submissionMetrics,
  ] = await Promise.all([
    getMetricsSummary(),
    getActiveSubscriptionsByTier(),
    getRevenueHistory(),
    getTrialMetrics(currentMonth, currentYear),
    getSubmissionMetrics(currentMonth, currentYear),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Subscription Analytics
        </h1>
        <p className="text-muted-foreground">
          Revenue metrics and business insights
        </p>
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueHistory} />
        <TierDistributionChart distribution={tierDistribution} />
      </div>

      {/* Trial Performance */}
      <TrialPerformance metrics={trialMetrics} />

      {/* Submission Usage */}
      <SubmissionUsage metrics={submissionMetrics} />
    </div>
  );
}
