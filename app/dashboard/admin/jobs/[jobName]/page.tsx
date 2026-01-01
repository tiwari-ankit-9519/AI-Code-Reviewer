// FILE PATH: app/dashboard/admin/jobs/[jobName]/page.tsx
// This is the DETAILED STATS PAGE for a specific job
// URL: /dashboard/admin/jobs/daily-tasks OR /dashboard/admin/jobs/monthly-tasks
// OPTIONAL: You can add links to this page from JobStatusCard for more details

import { getCronJobStats } from "@/lib/actions/admin-cron";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function JobDetailPage({
  params,
}: {
  params: { jobName: string };
}) {
  const stats = await getCronJobStats(params.jobName, 30);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-400 bg-green-500/20";
      case "PARTIAL":
        return "text-yellow-400 bg-yellow-500/20";
      case "FAILED":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  return (
    <>
      <Link
        href="/dashboard/admin/jobs"
        className="text-purple-400 hover:text-purple-300 mb-4 inline-block"
      >
        ← Back to Jobs
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 mb-2">
          {params.jobName.toUpperCase()} STATS
        </h1>
        <p className="text-gray-400">Last 30 days performance metrics</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total Runs</div>
          <div className="text-4xl font-black text-white">
            {stats.totalRuns}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-green-500/30 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Success Rate</div>
          <div className="text-4xl font-black text-green-400">
            {stats.successRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-blue-500/30 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Avg Duration</div>
          <div className="text-4xl font-black text-blue-400">
            {stats.avgDuration}
            <span className="text-lg">ms</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Last Run</div>
          <div className="text-2xl font-black text-yellow-400">
            {stats.lastRun
              ? formatDistanceToNow(new Date(stats.lastRun), {
                  addSuffix: true,
                })
              : "Never"}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-green-500/30 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Successful</div>
          <div className="text-3xl font-black text-green-400">
            {stats.successfulRuns}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-red-500/30 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Failed</div>
          <div className="text-3xl font-black text-red-400">
            {stats.failedRuns}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Partial</div>
          <div className="text-3xl font-black text-yellow-400">
            {stats.partialRuns}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
        <h2 className="text-2xl font-black text-white mb-4">
          Recent Executions
        </h2>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {stats.recentLogs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  {new Date(log.executedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                    log.status
                  )}`}
                >
                  {log.status}
                </span>
                <span className="text-sm text-gray-500 font-mono">
                  {log.duration}ms
                </span>
              </div>

              <details className="mt-2">
                <summary className="text-sm text-purple-400 cursor-pointer hover:text-purple-300">
                  View Results
                </summary>
                <pre className="text-xs text-gray-300 bg-gray-950 rounded p-3 mt-2 overflow-x-auto">
                  {JSON.stringify(log.results, null, 2)}
                </pre>
              </details>

              {log.error && (
                <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded p-2">
                  <p className="text-xs text-red-400 font-mono">{log.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
