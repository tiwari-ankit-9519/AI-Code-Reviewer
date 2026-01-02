"use client";

interface Metrics {
  mrr: number;
  arr: number;
  arpu: number;
  ltv: number;
  churnRate: number;
  trialConversion: number;
  revenueGrowth: number;
  userGrowth: number;
}

interface MetricsCardsProps {
  metrics: Metrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-gray-400";
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return "↗";
    if (value < 0) return "↘";
    return "→";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl">💰</span>
          <span
            className={`text-sm font-bold ${getTrendColor(
              metrics.revenueGrowth
            )}`}
          >
            {getTrendIcon(metrics.revenueGrowth)}{" "}
            {Math.abs(metrics.revenueGrowth).toFixed(1)}%
          </span>
        </div>
        <div className="text-gray-400 text-sm mb-1">
          Monthly Recurring Revenue
        </div>
        <div className="text-3xl font-black text-white">
          {formatCurrency(metrics.mrr)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          ARR: {formatCurrency(metrics.arr)}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl">👥</span>
          <span
            className={`text-sm font-bold ${getTrendColor(metrics.userGrowth)}`}
          >
            {getTrendIcon(metrics.userGrowth)}{" "}
            {Math.abs(metrics.userGrowth).toFixed(1)}%
          </span>
        </div>
        <div className="text-gray-400 text-sm mb-1">
          Average Revenue Per User
        </div>
        <div className="text-3xl font-black text-blue-400">
          {formatCurrency(metrics.arpu)}
        </div>
        <div className="text-xs text-gray-500 mt-1">Per month</div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-green-500/30 rounded-xl p-6 hover:border-green-500/50 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl">🎯</span>
          <span className="text-sm font-bold text-gray-400">LTV</span>
        </div>
        <div className="text-gray-400 text-sm mb-1">Trial Conversion Rate</div>
        <div className="text-3xl font-black text-green-400">
          {metrics.trialConversion.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Lifetime Value: {formatCurrency(metrics.ltv)}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/50 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl">⚠️</span>
          <span
            className={`text-sm font-bold ${
              metrics.churnRate < 5 ? "text-green-400" : "text-red-400"
            }`}
          >
            {metrics.churnRate < 5 ? "Good" : "High"}
          </span>
        </div>
        <div className="text-gray-400 text-sm mb-1">Churn Rate</div>
        <div className="text-3xl font-black text-yellow-400">
          {metrics.churnRate.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500 mt-1">Monthly churn</div>
      </div>
    </div>
  );
}
