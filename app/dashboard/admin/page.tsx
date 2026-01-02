import { prisma } from "@/lib/prisma";
import StatCard from "@/components/admin/StatCard";
import RecentActivity from "@/components/admin/RecentActivity";
import AlertsPanel from "@/components/admin/AlertsPanel";

async function getAdminStats() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const [
    totalUsers,
    activeSubscriptions,
    lastMonthRevenue,
    twoMonthsAgoRevenue,
    trialsStarted,
    trialsConverted,
    failedPayments,
    expiringTrials,
    activeUsers,
    cancelledThisMonth,
    totalCancelled,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        subscriptionStatus: "ACTIVE",
        subscriptionTier: { in: ["HERO", "LEGEND"] },
      },
    }),

    prisma.subscriptionHistory.count({
      where: {
        createdAt: { gte: lastMonth, lt: now },
        action: "SUBSCRIPTION_STARTED",
      },
    }),

    prisma.subscriptionHistory.count({
      where: {
        createdAt: { gte: twoMonthsAgo, lt: lastMonth },
        action: "SUBSCRIPTION_STARTED",
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
        subscriptionStatus: { in: ["ACTIVE", "TRIALING"] },
      },
    }),

    prisma.user.count({
      where: {
        subscriptionStatus: "CANCELLED",
        updatedAt: { gte: lastMonth },
      },
    }),

    prisma.user.count({
      where: {
        subscriptionStatus: "CANCELLED",
      },
    }),
  ]);

  const heroPrice = 299900;
  const legendPrice = 999900;

  const heroCount = await prisma.user.count({
    where: { subscriptionTier: "HERO", subscriptionStatus: "ACTIVE" },
  });

  const legendCount = await prisma.user.count({
    where: { subscriptionTier: "LEGEND", subscriptionStatus: "ACTIVE" },
  });

  const currentMRR = heroCount * heroPrice + legendCount * legendPrice;
  const previousMRR =
    currentMRR - (lastMonthRevenue - twoMonthsAgoRevenue) * heroPrice;

  const mrrGrowth =
    previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;

  const subscriptionGrowth =
    twoMonthsAgoRevenue > 0
      ? ((lastMonthRevenue - twoMonthsAgoRevenue) / twoMonthsAgoRevenue) * 100
      : 0;

  const trialConversion =
    trialsStarted > 0 ? (trialsConverted / trialsStarted) * 100 : 0;

  const churnRate =
    activeUsers > 0 ? (cancelledThisMonth / activeUsers) * 100 : 0;

  return {
    mrr: currentMRR,
    mrrGrowth,
    activeSubscriptions,
    subscriptionGrowth,
    trialConversion,
    conversionTrend: 0,
    churnRate,
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 mb-2">
          ADMIN DASHBOARD
        </h1>
        <p className="text-gray-400">Overview of your platform metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value={`₹${(stats.mrr / 100).toLocaleString("en-IN")}`}
          icon="💰"
          trend={stats.mrrGrowth}
          trendLabel={`${
            stats.mrrGrowth >= 0 ? "+" : ""
          }${stats.mrrGrowth.toFixed(1)}%`}
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions.toString()}
          icon="👥"
          trend={stats.subscriptionGrowth}
          trendLabel={`${
            stats.subscriptionGrowth >= 0 ? "+" : ""
          }${stats.subscriptionGrowth.toFixed(1)}%`}
        />
        <StatCard
          title="Trial Conversion Rate"
          value={`${stats.trialConversion.toFixed(1)}%`}
          icon="🎯"
          trend={stats.conversionTrend}
          trendLabel={`${stats.trialsConverted}/${stats.trialsStarted} converted`}
        />
        <StatCard
          title="Churn Rate"
          value={`${stats.churnRate.toFixed(1)}%`}
          icon="⚠️"
          trend={-stats.churnRate}
          trendLabel={`${stats.totalCancelled} total cancelled`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
          <h2 className="text-2xl font-black text-white mb-4">
            Recent Activity
          </h2>
          <RecentActivity limit={10} />
        </div>

        <AlertsPanel
          failedPayments={stats.failedPayments}
          expiringTrials={stats.expiringTrials}
        />
      </div>
    </div>
  );
}
