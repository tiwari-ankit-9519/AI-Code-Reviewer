import { prisma } from "@/lib/prisma";
import { getCronJobStats } from "@/lib/actions/admin-cron";
import CronMetricsChart from "@/components/admin/CronMetricsChart";
import CronHealthIndicator from "@/components/admin/CronHealthIndicator";

export default async function CronAnalyticsPage() {
  const [dailyStats, monthlyStats] = await Promise.all([
    getCronJobStats("daily-tasks", 30),
    getCronJobStats("monthly-tasks", 90),
  ]);

  // Calculate cutoff date outside of Prisma query
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const allLogs = await prisma.cronLog.findMany({
    where: {
      executedAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: { executedAt: "desc" },
    take: 100,
  });

  const manualTriggers = allLogs.filter((log) =>
    log.jobName.startsWith("manual-")
  );

  const failedJobs = allLogs.filter((log) => log.status === "FAILED");

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 mb-2">
          📊 CRON ANALYTICS
        </h1>
        <p className="text-gray-400">
          Performance metrics and health monitoring
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <CronHealthIndicator
          title="Daily Tasks Health"
          stats={dailyStats}
          color="blue"
        />
        <CronHealthIndicator
          title="Monthly Tasks Health"
          stats={monthlyStats}
          color="purple"
        />
        <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">
            Manual Triggers (30d)
          </div>
          <div className="text-4xl font-black text-yellow-400 mb-2">
            {manualTriggers.length}
          </div>
          <div className="text-xs text-gray-500">
            Last 30 days manual executions
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <CronMetricsChart
          title="Daily Tasks - Last 30 Days"
          logs={allLogs.filter((log) => log.jobName === "daily-tasks")}
        />
        <CronMetricsChart
          title="Monthly Tasks - Last 90 Days"
          logs={allLogs.filter((log) => log.jobName === "monthly-tasks")}
        />
      </div>

      {failedJobs.length > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-black text-red-400 mb-4">
            ⚠️ FAILED JOBS ({failedJobs.length})
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {failedJobs.map((log) => (
              <div
                key={log.id}
                className="bg-gray-900/50 border border-red-500/30 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-bold">{log.jobName}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(log.executedAt).toLocaleString()}
                  </span>
                </div>
                {log.error && (
                  <p className="text-sm text-red-400 font-mono">{log.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
        <h2 className="text-2xl font-black text-white mb-4">
          📋 Recent Activity (Last 100)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 text-sm py-3 px-4">
                  Job Name
                </th>
                <th className="text-left text-gray-400 text-sm py-3 px-4">
                  Status
                </th>
                <th className="text-left text-gray-400 text-sm py-3 px-4">
                  Duration
                </th>
                <th className="text-left text-gray-400 text-sm py-3 px-4">
                  Executed At
                </th>
              </tr>
            </thead>
            <tbody>
              {allLogs.slice(0, 20).map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-800 hover:bg-gray-700/30"
                >
                  <td className="py-3 px-4">
                    <span className="text-white font-mono text-sm">
                      {log.jobName}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        log.status === "SUCCESS"
                          ? "bg-green-500/20 text-green-400"
                          : log.status === "PARTIAL"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-400 font-mono text-sm">
                      {log.duration}ms
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-400 text-sm">
                      {new Date(log.executedAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
