// app/dashboard/admin/system-health/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import {
  checkSystemHealth,
  monitorSessionServiceHealth,
  getErrorMetrics,
} from "@/lib/monitoring/error-tracker";

export const dynamic = "force-dynamic";

async function getHealthData() {
  const now = Date.now();
  const startDate = new Date(now - 24 * 60 * 60 * 1000);
  const endDate = new Date(now);

  const [systemHealth, serviceHealth, errorMetrics] = await Promise.all([
    checkSystemHealth(),
    monitorSessionServiceHealth(),
    getErrorMetrics(startDate, endDate),
  ]);

  return { systemHealth, serviceHealth, errorMetrics };
}

export default async function SystemHealthPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { systemHealth, serviceHealth, errorMetrics } = await getHealthData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/50";
      case "degraded":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/50";
      case "critical":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/50";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5" />;
      case "critical":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 mb-2">
          <Activity className="h-10 w-10" />
          System Health
        </h1>
        <p className="text-muted-foreground">
          Monitor system status and session service health
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall System Status</span>
              <Badge
                className={`${getStatusColor(
                  systemHealth.healthy ? "healthy" : "critical"
                )} border-2`}
              >
                {getStatusIcon(systemHealth.healthy ? "healthy" : "critical")}
                <span className="ml-2">
                  {systemHealth.healthy ? "HEALTHY" : "ISSUES DETECTED"}
                </span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {systemHealth.healthy ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">All systems operational</span>
              </div>
            ) : (
              <div className="space-y-2">
                {systemHealth.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-red-600 dark:text-red-400"
                  >
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span className="text-sm">{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Session Service</span>
              <Badge
                className={`${getStatusColor(serviceHealth.status)} border-2`}
              >
                {getStatusIcon(serviceHealth.status)}
                <span className="ml-2 uppercase">{serviceHealth.status}</span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Active Sessions
                </span>
                <span className="font-bold">
                  {serviceHealth.metrics.activeSessions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Active Cooling Periods
                </span>
                <span className="font-bold">
                  {serviceHealth.metrics.activeCoolingPeriods}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Avg Session Duration
                </span>
                <span className="font-bold">
                  {serviceHealth.metrics.avgSessionDuration} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Failed Creations (1h)
                </span>
                <span
                  className={`font-bold ${
                    serviceHealth.metrics.failedSessionCreations > 0
                      ? "text-red-600 dark:text-red-400"
                      : ""
                  }`}
                >
                  {serviceHealth.metrics.failedSessionCreations}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Error Metrics (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="text-center p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Total Errors</p>
              <p
                className={`text-3xl font-bold ${
                  errorMetrics.totalErrors > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {errorMetrics.totalErrors}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">
                Critical Errors
              </p>
              <p
                className={`text-3xl font-bold ${
                  errorMetrics.criticalErrors > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {errorMetrics.criticalErrors}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Error Rate</p>
              <p className="text-3xl font-bold">
                {errorMetrics.totalErrors > 0
                  ? ((errorMetrics.totalErrors / 24) * 100).toFixed(1)
                  : "0"}
                %
              </p>
            </div>
          </div>

          {errorMetrics.recentErrors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Recent Errors</h3>
              <div className="space-y-2">
                {errorMetrics.recentErrors.map((error, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-red-500/5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="font-mono">
                        {error.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                      {error.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMetrics.recentErrors.length === 0 && (
            <div className="text-center py-8 text-green-600 dark:text-green-400">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="font-semibold">No errors in the last 24 hours</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
