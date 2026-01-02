import Link from "next/link";

interface AlertsPanelProps {
  failedPayments: number;
  expiringTrials: number;
}

export default function AlertsPanel({
  failedPayments,
  expiringTrials,
}: AlertsPanelProps) {
  const hasAlerts = failedPayments > 0 || expiringTrials > 0;

  if (!hasAlerts) {
    return (
      <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-6">
        <h2 className="text-xl font-black text-green-400 mb-4">✅ All Clear</h2>
        <p className="text-green-300">
          No alerts at this time. Everything is running smoothly!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6">
      <h2 className="text-xl font-black text-red-400 mb-4 flex items-center gap-2">
        <span>⚠️</span>
        <span>Alerts</span>
      </h2>
      <div className="space-y-3">
        {failedPayments > 0 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-red-300 mb-1">Failed Payments</p>
                <p className="text-sm text-red-400">
                  {failedPayments}{" "}
                  {failedPayments === 1 ? "user has" : "users have"} failed
                  payment{failedPayments !== 1 ? "s" : ""} that need attention
                </p>
              </div>
              <Link
                href="/dashboard/admin/subscriptions?status=PAST_DUE"
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-bold transition-all"
              >
                View
              </Link>
            </div>
          </div>
        )}

        {expiringTrials > 0 && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-yellow-300 mb-1">
                  Expiring Trials
                </p>
                <p className="text-sm text-yellow-400">
                  {expiringTrials} trial{expiringTrials !== 1 ? "s" : ""}{" "}
                  expiring in the next 3 days
                </p>
              </div>
              <Link
                href="/dashboard/admin/users?status=TRIALING"
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm font-bold transition-all"
              >
                View
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
