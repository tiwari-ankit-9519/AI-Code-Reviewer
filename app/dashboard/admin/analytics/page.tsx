import { prisma } from "@/lib/prisma";
import { getCronJobStats } from "@/lib/actions/admin-cron";
import CronMetricsChart from "@/components/admin/CronMetricsChart";
import CronHealthIndicator from "@/components/admin/CronHealthIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart3, AlertTriangle, Activity, Zap } from "lucide-react";

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

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "SUCCESS":
        return "default";
      case "PARTIAL":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Cron Analytics
        </h1>
        <p className="text-muted-foreground">
          Performance metrics and health monitoring
        </p>
      </div>

      {/* Health Indicators */}
      <div className="grid md:grid-cols-3 gap-6">
        <CronHealthIndicator title="Daily Tasks Health" stats={dailyStats} />
        <CronHealthIndicator
          title="Monthly Tasks Health"
          stats={monthlyStats}
        />

        <Card className="border-yellow-500/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Manual Triggers (30d)
              </p>
            </div>
            <p className="text-4xl font-bold mb-2">{manualTriggers.length}</p>
            <p className="text-xs text-muted-foreground">
              Last 30 days manual executions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <CronMetricsChart
          title="Daily Tasks - Last 30 Days"
          logs={allLogs.filter((log) => log.jobName === "daily-tasks")}
        />
        <CronMetricsChart
          title="Monthly Tasks - Last 90 Days"
          logs={allLogs.filter((log) => log.jobName === "monthly-tasks")}
        />
      </div>

      {/* Failed Jobs Alert */}
      {failedJobs.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed Jobs ({failedJobs.length})</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 max-h-64 overflow-y-auto mt-4">
              {failedJobs.map((log) => (
                <Card key={log.id} className="bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold font-mono text-sm">
                        {log.jobName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.executedAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    {log.error && (
                      <p className="text-sm font-mono text-destructive">
                        {log.error}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity (Last 100)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Executed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allLogs.slice(0, 20).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {log.jobName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {log.duration}ms
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.executedAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
