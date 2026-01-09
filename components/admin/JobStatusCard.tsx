// components/admin/JobStatusCard.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  Activity,
} from "lucide-react";

interface JobExecution {
  executedAt: Date;
  status: string;
  duration: number;
  results: Prisma.JsonValue;
}

interface JobStats {
  totalRuns: number;
  successfulRuns: number;
  successRate: number;
}

interface JobStatus {
  jobName: string;
  lastExecution: {
    executedAt: Date;
    status: string;
    duration: number;
    results: Prisma.JsonValue;
    error: string | null;
  } | null;
  recentExecutions: JobExecution[];
  stats: JobStats;
}

export default function JobStatusCard({ job }: { job: JobStatus }) {
  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "SUCCESS":
        return "default";
      case "PARTIAL":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600 dark:text-green-400";
      case "PARTIAL":
        return "text-yellow-600 dark:text-yellow-400";
      case "FAILED":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const renderStatusIcon = (status: string, size: "sm" | "md" = "md") => {
    const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    const colorClass = getStatusColor(status);

    switch (status) {
      case "SUCCESS":
        return <CheckCircle className={`${iconClass} ${colorClass}`} />;
      case "PARTIAL":
        return <AlertCircle className={`${iconClass} ${colorClass}`} />;
      case "FAILED":
        return <XCircle className={`${iconClass} ${colorClass}`} />;
      default:
        return <Activity className={`${iconClass} ${colorClass}`} />;
    }
  };

  const formatJobName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatLastResult = (result: Prisma.JsonValue) => {
    if (!result || typeof result !== "object") return null;

    const resultObj = result as Record<string, unknown>;
    const entries = Object.entries(resultObj).filter(
      ([key]) => key !== "success" && key !== "message"
    );

    if (entries.length === 0) return null;

    return (
      <div className="space-y-2">
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
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {job.lastExecution
              ? renderStatusIcon(job.lastExecution.status)
              : renderStatusIcon("PENDING")}
            {formatJobName(job.jobName)}
          </CardTitle>
          {job.lastExecution && (
            <Badge variant={getStatusVariant(job.lastExecution.status)}>
              {job.lastExecution.status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {job.lastExecution ? (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last Run
                </div>
                <span className="text-sm font-semibold">
                  {formatDistanceToNow(new Date(job.lastExecution.executedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="text-sm font-mono font-semibold">
                  {job.lastExecution.duration}ms
                </span>
              </div>
            </div>

            {/* Success Rate */}
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Success Rate
                </div>
                <span
                  className={`text-lg font-bold ${
                    job.stats.successRate >= 90
                      ? "text-green-600 dark:text-green-400"
                      : job.stats.successRate >= 70
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {job.stats.successRate.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Last Result */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Last Result:
              </p>
              {formatLastResult(job.lastExecution.results)}
            </div>

            {/* Error Alert */}
            {job.lastExecution.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="font-mono text-xs">
                  {job.lastExecution.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Runs</span>
                <span className="font-semibold">{job.stats.totalRuns}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Successful</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {job.stats.successfulRuns}
                </span>
              </div>
            </div>

            {/* Recent Executions */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline w-full">
                <ChevronDown className="h-4 w-4" />
                Recent Executions ({job.recentExecutions.length})
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {job.recentExecutions.map((exec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border bg-card p-3"
                    >
                      <div className="flex items-center gap-2">
                        {renderStatusIcon(exec.status, "sm")}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(exec.executedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={getStatusVariant(exec.status)}
                          className="text-xs"
                        >
                          {exec.status}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {exec.duration}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No executions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
