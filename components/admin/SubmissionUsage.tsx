interface SubmissionMetrics {
  total: number;
  byTier: {
    starter: number;
    hero: number;
    legend: number;
  };
  avgPerUser: number;
}

interface SubmissionUsageProps {
  metrics: SubmissionMetrics;
}

export default function SubmissionUsage({ metrics }: SubmissionUsageProps) {
  const getPercentage = (value: number) => {
    return metrics.total > 0 ? ((value / metrics.total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
      <h2 className="text-2xl font-black text-white mb-6">Submission Usage</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <div className="text-gray-400 text-sm mb-2">
              Total Submissions This Month
            </div>
            <div className="text-5xl font-black text-white">
              {metrics.total.toLocaleString()}
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Starter Tier</span>
                <span className="text-sm font-bold text-gray-400">
                  {metrics.byTier.starter} (
                  {getPercentage(metrics.byTier.starter)}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full transition-all"
                  style={{ width: `${getPercentage(metrics.byTier.starter)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-purple-400">Hero Tier</span>
                <span className="text-sm font-bold text-purple-400">
                  {metrics.byTier.hero} ({getPercentage(metrics.byTier.hero)}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${getPercentage(metrics.byTier.hero)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-yellow-400">Legend Tier</span>
                <span className="text-sm font-bold text-yellow-400">
                  {metrics.byTier.legend} (
                  {getPercentage(metrics.byTier.legend)}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${getPercentage(metrics.byTier.legend)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-lg font-black text-white mb-4">
            Average Submissions per User
          </h3>
          <div className="text-6xl font-black text-purple-400 mb-4">
            {metrics.avgPerUser.toFixed(1)}
          </div>
          <p className="text-sm text-gray-400 mb-6">
            submissions per user this month
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Starter (Limit: 5)</span>
              <span className="text-sm font-bold text-gray-300">
                {metrics.byTier.starter > 0 ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-400">Hero (Unlimited)</span>
              <span className="text-sm font-bold text-purple-300">
                {metrics.byTier.hero > 0 ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-400">
                Legend (Unlimited)
              </span>
              <span className="text-sm font-bold text-yellow-300">
                {metrics.byTier.legend > 0 ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
