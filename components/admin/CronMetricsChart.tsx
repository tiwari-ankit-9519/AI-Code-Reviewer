"use client";

import { Prisma } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

interface CronLog {
  id: string;
  jobName: string;
  status: string;
  duration: number;
  executedAt: Date;
  results: Prisma.JsonValue;
  error: string | null;
}

interface CronMetricsChartProps {
  title: string;
  logs: CronLog[];
}

export default function CronMetricsChart({
  title,
  logs,
}: CronMetricsChartProps) {
  const recentLogs = logs.slice(0, 10).reverse();

  const maxDuration = Math.max(...recentLogs.map((log) => log.duration), 1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500";
      case "PARTIAL":
        return "bg-yellow-500";
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const avgDuration =
    recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.duration, 0) /
        recentLogs.length
      : 0;

  const successCount = recentLogs.filter(
    (log) => log.status === "SUCCESS"
  ).length;
  const successRate =
    recentLogs.length > 0 ? (successCount / recentLogs.length) * 100 : 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-black text-white mb-2">{title}</h3>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-400">Avg Duration:</span>
            <span className="text-white font-bold ml-2">
              {Math.round(avgDuration)}ms
            </span>
          </div>
          <div>
            <span className="text-gray-400">Success Rate:</span>
            <span className="text-green-400 font-bold ml-2">
              {successRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {recentLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No execution data available
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">
              Execution Duration Trend
            </div>
            <div className="flex items-end gap-2 h-32">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div className="text-xs text-gray-500 font-mono">
                    {log.duration}ms
                  </div>
                  <div
                    className={`w-full ${getStatusColor(
                      log.status
                    )} rounded-t transition-all hover:opacity-80 cursor-pointer relative group`}
                    style={{
                      height: `${(log.duration / maxDuration) * 100}%`,
                      minHeight: "4px",
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded whitespace-nowrap z-10 border border-gray-700">
                      <div className="font-bold">{log.status}</div>
                      <div>
                        {new Date(log.executedAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Oldest</span>
              <span>Latest</span>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs text-gray-500 mb-2">
              Status Distribution
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-green-500/20 border border-green-500/30 rounded p-2 text-center">
                <div className="text-green-400 font-bold text-lg">
                  {recentLogs.filter((log) => log.status === "SUCCESS").length}
                </div>
                <div className="text-xs text-gray-400">Success</div>
              </div>
              <div className="flex-1 bg-yellow-500/20 border border-yellow-500/30 rounded p-2 text-center">
                <div className="text-yellow-400 font-bold text-lg">
                  {recentLogs.filter((log) => log.status === "PARTIAL").length}
                </div>
                <div className="text-xs text-gray-400">Partial</div>
              </div>
              <div className="flex-1 bg-red-500/20 border border-red-500/30 rounded p-2 text-center">
                <div className="text-red-400 font-bold text-lg">
                  {recentLogs.filter((log) => log.status === "FAILED").length}
                </div>
                <div className="text-xs text-gray-400">Failed</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-500 mb-2">Latest Execution</div>
            {recentLogs[recentLogs.length - 1] && (
              <div className="text-sm text-gray-400">
                {formatDistanceToNow(
                  new Date(recentLogs[recentLogs.length - 1].executedAt),
                  { addSuffix: true }
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
