interface TrialMetrics {
  started: number;
  converted: number;
  expired: number;
  conversionRate: number;
}

interface TrialPerformanceProps {
  metrics: TrialMetrics;
}

export default function TrialPerformance({ metrics }: TrialPerformanceProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
      <h2 className="text-2xl font-black text-white mb-6">Trial Performance</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-blue-500/30">
          <div className="text-blue-400 text-sm mb-2">Trials Started</div>
          <div className="text-4xl font-black text-white">
            {metrics.started}
          </div>
          <div className="text-xs text-gray-500 mt-2">This month</div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-green-500/30">
          <div className="text-green-400 text-sm mb-2">Converted to Paid</div>
          <div className="text-4xl font-black text-white">
            {metrics.converted}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {metrics.started > 0
              ? ((metrics.converted / metrics.started) * 100).toFixed(1)
              : 0}
            % of trials
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-red-500/30">
          <div className="text-red-400 text-sm mb-2">Expired</div>
          <div className="text-4xl font-black text-white">
            {metrics.expired}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {metrics.started > 0
              ? ((metrics.expired / metrics.started) * 100).toFixed(1)
              : 0}
            % of trials
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/30">
          <div className="text-purple-400 text-sm mb-2">Conversion Rate</div>
          <div className="text-4xl font-black text-white">
            {metrics.conversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {metrics.conversionRate >= 20 ? "Above target" : "Below target"}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-blue-400 font-bold mb-1">Trial Insights</p>
            <p className="text-sm text-gray-300">
              {metrics.conversionRate >= 20
                ? "Great conversion rate! Your trial experience is working well."
                : "Consider improving onboarding to increase trial conversions."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
