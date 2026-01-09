"use client";

import { Prisma } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

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
        return "bg-muted";
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

  const partialCount = recentLogs.filter(
    (log) => log.status === "PARTIAL"
  ).length;
  const failedCount = recentLogs.filter(
    (log) => log.status === "FAILED"
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex gap-4 text-sm mt-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Avg Duration:</span>
            <span className="font-semibold">{Math.round(avgDuration)}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Success Rate:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {successRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {recentLogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No execution data available
          </div>
        ) : (
          <div className="space-y-6">
            {/* Execution Duration Trend */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-3">
                Execution Duration Trend
              </div>
              <div className="flex items-end gap-2 h-32">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div className="text-xs text-muted-foreground font-mono">
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
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-md whitespace-nowrap z-10 border">
                        <div className="font-semibold">{log.status}</div>
                        <div className="text-muted-foreground">
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
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Oldest</span>
                <span>Latest</span>
              </div>
            </div>

            {/* Status Distribution */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-3">
                Status Distribution
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Card className="border-green-500/50 bg-green-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {successCount}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Success</div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-500/50 bg-yellow-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {partialCount}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Partial</div>
                  </CardContent>
                </Card>

                <Card className="border-red-500/50 bg-red-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {failedCount}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Latest Execution */}
            <div className="pt-4 border-t">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Latest Execution
              </div>
              {recentLogs[recentLogs.length - 1] && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDistanceToNow(
                      new Date(recentLogs[recentLogs.length - 1].executedAt),
                      { addSuffix: true }
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
