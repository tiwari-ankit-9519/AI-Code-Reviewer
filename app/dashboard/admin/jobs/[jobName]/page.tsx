import { getCronJobStats } from "@/lib/actions/admin-cron";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  XCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobName: string }>;
}) {
  const { jobName } = await params;
  const stats = await getCronJobStats(jobName, 30);

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

  const formatJobName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatResults = (results: unknown) => {
    if (!results || typeof results !== "object") return null;

    const resultObj = results as Record<string, unknown>;
    const entries = Object.entries(resultObj).filter(
      ([key]) => key !== "success" && key !== "message"
    );

    if (entries.length === 0) return JSON.stringify(results, null, 2);

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
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/admin/jobs">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Activity className="h-8 w-8" />
          {formatJobName(jobName)} Stats
        </h1>
        <p className="text-muted-foreground">
          Last 30 days performance metrics
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Total Runs
              </p>
            </div>
            <p className="text-4xl font-bold">{stats.totalRuns}</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Success Rate
              </p>
            </div>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
              {stats.successRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Avg Duration
              </p>
            </div>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {stats.avgDuration}
              <span className="text-lg">ms</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Last Run
              </p>
            </div>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.lastRun
                ? formatDistanceToNow(new Date(stats.lastRun), {
                    addSuffix: true,
                  })
                : "Never"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-muted-foreground">
                Successful
              </p>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.successfulRuns}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-muted-foreground">
                Failed
              </p>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.failedRuns}
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm font-medium text-muted-foreground">
                Partial
              </p>
            </div>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.partialRuns}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {stats.recentLogs.map((log) => (
              <Card key={log.id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.executedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(log.status)}>
                        {log.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground font-mono">
                        {log.duration}ms
                      </span>
                    </div>
                  </div>

                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ChevronDown className="h-4 w-4" />
                      View Results
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <div className="rounded-lg border bg-card p-3">
                        {formatResults(log.results)}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {log.error && (
                    <Alert variant="destructive" className="mt-3">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription className="font-mono text-xs">
                        {log.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
