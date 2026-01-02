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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 mb-2">
          📊 SUBSCRIPTION ANALYTICS
        </h1>
        <p className="text-gray-400">Revenue metrics and business insights</p>
      </div>

      <MetricsCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueHistory} />
        <TierDistributionChart distribution={tierDistribution} />
      </div>

      <TrialPerformance metrics={trialMetrics} />

      <SubmissionUsage metrics={submissionMetrics} />
    </div>
  );
}
