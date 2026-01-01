"use client";

interface CronStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  avgDuration: number;
}

interface CronHealthIndicatorProps {
  title: string;
  stats: CronStats;
  color: "blue" | "purple" | "green" | "red";
}

export default function CronHealthIndicator({
  title,
  stats,
  color,
}: CronHealthIndicatorProps) {
  const getHealthStatus = (successRate: number) => {
    if (successRate >= 95) return { label: "EXCELLENT", icon: "🟢" };
    if (successRate >= 85) return { label: "GOOD", icon: "🟡" };
    if (successRate >= 70) return { label: "WARNING", icon: "🟠" };
    return { label: "CRITICAL", icon: "🔴" };
  };

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "border-blue-500/30 from-blue-500/10 to-blue-600/10";
      case "purple":
        return "border-purple-500/30 from-purple-500/10 to-purple-600/10";
      case "green":
        return "border-green-500/30 from-green-500/10 to-green-600/10";
      case "red":
        return "border-red-500/30 from-red-500/10 to-red-600/10";
    }
  };

  const health = getHealthStatus(stats.successRate);

  return (
    <div
      className={`bg-linear-to-br ${getColorClasses()} backdrop-blur-sm border-2 rounded-xl p-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">{title}</h3>
        <span className="text-2xl">{health.icon}</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-gray-400 text-xs mb-1">Health Status</div>
          <div className="text-white font-black text-xl">{health.label}</div>
        </div>

        <div>
          <div className="text-gray-400 text-xs mb-1">Success Rate</div>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-black text-2xl">
              {stats.successRate.toFixed(1)}%
            </span>
            <span className="text-gray-500 text-sm">
              ({stats.successfulRuns}/{stats.totalRuns})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-gray-400 text-xs mb-1">Avg Duration</div>
            <div className="text-white font-bold">{stats.avgDuration}ms</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-1">Failed</div>
            <div className="text-red-400 font-bold">{stats.failedRuns}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              stats.successRate >= 95
                ? "bg-green-500"
                : stats.successRate >= 85
                ? "bg-yellow-500"
                : stats.successRate >= 70
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
            style={{ width: `${stats.successRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
