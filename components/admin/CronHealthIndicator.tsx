"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
} from "lucide-react";

interface CronStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  avgDuration: number;
  lastResult?: Record<string, unknown>;
}

interface CronHealthIndicatorProps {
  title: string;
  stats: CronStats;
}

export default function CronHealthIndicator({
  title,
  stats,
}: CronHealthIndicatorProps) {
  const getHealthStatus = (successRate: number) => {
    if (successRate >= 95)
      return {
        label: "Excellent",
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
      };
    if (successRate >= 85)
      return {
        label: "Good",
        variant: "secondary" as const,
        icon: AlertCircle,
        color: "text-yellow-600 dark:text-yellow-400",
      };
    if (successRate >= 70)
      return {
        label: "Warning",
        variant: "outline" as const,
        icon: AlertTriangle,
        color: "text-orange-600 dark:text-orange-400",
      };
    return {
      label: "Critical",
      variant: "destructive" as const,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
    };
  };

  const health = getHealthStatus(stats.successRate);
  const HealthIcon = health.icon;

  const getProgressColor = (rate: number) => {
    if (rate >= 95) return "bg-green-500";
    if (rate >= 85) return "bg-yellow-500";
    if (rate >= 70) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatLastResult = (result: Record<string, unknown>) => {
    if (!result) return null;

    const entries = Object.entries(result).filter(
      ([key]) => key !== "success" && key !== "message"
    );

    if (entries.length === 0) return null;

    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground mb-2">
          Last Result:
        </p>
        {entries.map(([key, value]) => {
          const formattedKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();

          let displayValue: string;
          if (Array.isArray(value)) {
            displayValue = value.length === 0 ? "None" : value.join(", ");
          } else if (typeof value === "object" && value !== null) {
            displayValue = JSON.stringify(value);
          } else {
            displayValue = String(value);
          }

          return (
            <div
              key={key}
              className="flex items-center justify-between text-sm py-1 px-2 rounded-md bg-muted/50"
            >
              <span className="text-muted-foreground">{formattedKey}:</span>
              <span className="font-mono font-semibold">
                {displayValue === "0" || displayValue === "None" ? (
                  <span className="text-muted-foreground">{displayValue}</span>
                ) : (
                  <span className="text-primary">{displayValue}</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <Badge variant={health.variant} className="gap-1">
            <HealthIcon className="h-3 w-3" />
            {health.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success Rate */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Success Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${health.color}`}>
                {stats.successRate.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                ({stats.successfulRuns}/{stats.totalRuns})
              </span>
            </div>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all ${getProgressColor(
                stats.successRate
              )}`}
              style={{ width: `${stats.successRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Avg Duration
            </div>
            <div className="text-lg font-bold">{stats.avgDuration}ms</div>
          </div>
          <div className="space-y-1 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <XCircle className="h-3 w-3" />
              Failed
            </div>
            <div className="text-lg font-bold text-destructive">
              {stats.failedRuns}
            </div>
          </div>
        </div>

        {/* Total Runs */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            Total Runs
          </div>
          <span className="font-semibold">{stats.totalRuns}</span>
        </div>

        {/* Last Result */}
        {stats.lastResult && (
          <div className="rounded-lg border bg-muted/30 p-3">
            {formatLastResult(stats.lastResult)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
