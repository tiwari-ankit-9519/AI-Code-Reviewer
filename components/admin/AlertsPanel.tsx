import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";

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
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            All Clear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No alerts at this time. Everything is running smoothly!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Alerts
          <Badge variant="destructive" className="ml-auto">
            {failedPayments + expiringTrials}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {failedPayments > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed Payments</AlertTitle>
            <AlertDescription className="mt-2 flex items-center justify-between">
              <span className="text-sm">
                {failedPayments}{" "}
                {failedPayments === 1 ? "user has" : "users have"} failed
                payment{failedPayments !== 1 ? "s" : ""} that need attention
              </span>
              <Link href="/dashboard/admin/subscription?status=PAST_DUE">
                <Button size="sm" variant="outline" className="ml-4">
                  View
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {expiringTrials > 0 && (
          <Alert className="border-amber-500/50 bg-amber-500/5 [&>svg]:text-amber-600">
            <Clock className="h-4 w-4" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">
              Expiring Trials
            </AlertTitle>
            <AlertDescription className="mt-2 flex items-center justify-between text-amber-800 dark:text-amber-200">
              <span className="text-sm">
                {expiringTrials} trial{expiringTrials !== 1 ? "s" : ""} expiring
                in the next 3 days
              </span>
              <Link href="/dashboard/admin/users?status=TRIALING">
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-4 border-amber-500/50 hover:bg-amber-500/10"
                >
                  View
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
