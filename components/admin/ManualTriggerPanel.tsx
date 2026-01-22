"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Clock,
  Mail,
  RotateCcw,
  CreditCard,
  BarChart3,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  triggerExpireTrials,
  triggerTrialReminders,
  triggerResetSubmissions,
  triggerSyncStripe,
  triggerGenerateSnapshotAndEmail,
  triggerEmailAdminReport,
} from "@/lib/actions/admin-cron";

interface CronActionResult {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

interface TriggerButton {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => Promise<CronActionResult>;
  variant: "destructive" | "outline" | "default" | "secondary";
}

export default function ManualTriggerPanel() {
  const [loading, setLoading] = useState<string | null>(null);

  const formatResultValue = (key: string, value: unknown): string => {
    // Handle snapshot object specially
    if (key === "snapshot" && typeof value === "object" && value !== null) {
      const snapshot = value as { period?: string; [key: string]: unknown };
      return snapshot.period || "Snapshot generated";
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.length === 0 ? "None" : value.length.toString();
    }

    // Handle objects
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }

    // Handle primitives
    return String(value);
  };

  const handleTrigger = async (button: TriggerButton) => {
    setLoading(button.id);
    try {
      const result = await button.action();

      if (result.success) {
        // Format result for display, excluding 'success' and handling snapshot
        const resultData = Object.entries(result)
          .filter(([key]) => key !== "success")
          .map(([key, value]) => {
            const formattedKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())
              .trim();

            const formattedValue = formatResultValue(key, value);

            return `${formattedKey}: ${formattedValue}`;
          })
          .join("\n");

        toast.success(`${button.label} completed!`, {
          description: resultData || "Operation completed successfully",
          duration: 5000,
        });
      } else {
        toast.error(`${button.label} failed`, {
          description: result.error || "Unknown error",
          duration: 5000,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Error", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(null);
    }
  };

  const buttons: TriggerButton[] = [
    {
      id: "expire-trials",
      label: "Expire Trials",
      description: "Downgrade expired trial users to Starter",
      icon: Clock,
      action: triggerExpireTrials,
      variant: "destructive",
    },
    {
      id: "trial-reminders",
      label: "Send Trial Reminders",
      description: "Email users with trials ending in 24h",
      icon: Mail,
      action: triggerTrialReminders,
      variant: "outline",
    },
    {
      id: "reset-submissions",
      label: "Reset Submissions",
      description: "Reset all users' monthly submission counts",
      icon: RotateCcw,
      action: triggerResetSubmissions,
      variant: "secondary",
    },
    {
      id: "sync-stripe",
      label: "Sync Stripe",
      description: "Sync subscription status with Stripe",
      icon: CreditCard,
      action: triggerSyncStripe,
      variant: "secondary",
    },
    {
      id: "generate-snapshot",
      label: "Generate Snapshot",
      description: "Create analytics snapshot and send email",
      icon: BarChart3,
      action: triggerGenerateSnapshotAndEmail,
      variant: "default",
    },
    {
      id: "email-report",
      label: "Email Report",
      description: "Generate snapshot and email monthly report",
      icon: Send,
      action: triggerEmailAdminReport,
      variant: "default",
    },
  ];

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <BarChart3 className="h-6 w-6" />
          Manual Triggers
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manually execute cron jobs for testing or emergency situations
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Warning Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Caution</AlertTitle>
          <AlertDescription>
            These actions trigger actual system operations. Use carefully in
            production.
          </AlertDescription>
        </Alert>

        {/* Info Alert for Snapshot vs Email */}
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">
            Snapshot vs Email Report
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Generate Snapshot:</strong> Creates analytics data and sends
            email
            <br />
            <strong>Email Report:</strong> Alternative way to generate and email
            the report
          </AlertDescription>
        </Alert>

        {/* Action Buttons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buttons.map((button) => {
            const Icon = button.icon;
            const isLoading = loading === button.id;
            const isDisabled = loading !== null;

            return (
              <Card
                key={button.id}
                className={`${
                  isLoading
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                } transition-all duration-200`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div
                      className={`p-4 rounded-full ${
                        isLoading
                          ? "bg-primary/10"
                          : button.variant === "destructive"
                            ? "bg-destructive/10"
                            : "bg-muted"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <Icon
                          className={`h-6 w-6 ${
                            button.variant === "destructive"
                              ? "text-destructive"
                              : "text-primary"
                          }`}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">{button.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {button.description}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleTrigger(button)}
                      disabled={isDisabled}
                      variant={button.variant}
                      className="w-full"
                      size="sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Icon className="h-4 w-4 mr-2" />
                          Run
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
