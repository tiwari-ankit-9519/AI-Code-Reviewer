"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UsageProgress } from "@/components/subscription/usage-progress";
import { submitCode } from "@/lib/actions/submissions";
import {
  ArrowLeft,
  FileCode,
  Send,
  AlertCircle,
  Zap,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function NewSubmissionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usageData, setUsageData] = useState<{
    tier: string;
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    nextResetDate: string;
  } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [formData, setFormData] = useState({
    fileName: "",
    language: "javascript",
    code: "",
  });

  useEffect(() => {
    async function checkUsage() {
      try {
        const response = await fetch("/api/subscription/usage");
        const data = await response.json();
        setUsageData(data);
      } catch (error) {
        console.error("Failed to fetch usage data:", error);
      }
    }
    checkUsage();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitCode({
        code: formData.code,
        language: formData.language,
        fileName: formData.fileName || `untitled.${formData.language}`,
      });

      toast.success("Code submitted successfully!", {
        description: "Your code is being reviewed by AI",
      });

      router.push(`/dashboard/submissions/${result.id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit code";
      const errorName = error instanceof Error ? error.name : "";

      if (
        errorName === "SubmissionLimitError" ||
        errorMessage.includes("limit")
      ) {
        setShowUpgradeModal(true);
        toast.error("Monthly limit reached", {
          description: "Upgrade to Hero for unlimited submissions",
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextResetDate = usageData?.nextResetDate
    ? new Date(usageData.nextResetDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 -ml-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <FileCode className="h-8 w-8" />
          New Submission
        </h1>
        <p className="text-muted-foreground">
          Submit your code for AI-powered review and analysis
        </p>
      </div>

      {/* Usage Warning for Starter Tier */}
      {usageData?.tier === "STARTER" && usageData.remaining > 0 && (
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-600 dark:text-blue-400">
            {usageData.remaining} / {usageData.limit} submissions remaining
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 mb-3">
              <UsageProgress
                current={usageData.used}
                limit={usageData.limit}
                tier="STARTER"
              />
            </div>
            {usageData.percentage >= 80 && (
              <Link href="/pricing">
                <Button size="sm" className="mt-2">
                  Upgrade to Hero
                </Button>
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Limit Reached */}
      {usageData?.remaining === 0 ? (
        <Card className="border-destructive">
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Submission Limit Reached
              </h2>
              <p className="text-muted-foreground">
                You&apos;ve used all 5 submissions this month. Upgrade to Hero
                for unlimited submissions!
              </p>
            </div>
            <div className="space-y-2">
              <Link href="/pricing">
                <Button size="lg" className="w-full sm:w-auto">
                  Upgrade to Hero - ₹2999/month
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Or wait until {nextResetDate} for your submissions to reset
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Name */}
              <div className="space-y-2">
                <Label htmlFor="fileName">File Name *</Label>
                <Input
                  id="fileName"
                  name="fileName"
                  required
                  value={formData.fileName}
                  onChange={handleInputChange}
                  placeholder="e.g., MyComponent.jsx or script.py"
                  className="font-mono"
                />
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Programming Language *</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger id="language" className="font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                    <SelectItem value="swift">Swift</SelectItem>
                    <SelectItem value="kotlin">Kotlin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Textarea
                  id="code"
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleInputChange}
                  rows={15}
                  placeholder="Paste your code here..."
                  className="font-mono text-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-2"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Code
                </>
              )}
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      )}

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Upgrade to Hero
            </DialogTitle>
            <DialogDescription>
              You&apos;ve reached your monthly limit of 5 submissions. Upgrade
              to Hero tier for unlimited code reviews!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>Unlimited submissions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>Priority AI reviews</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>Advanced analytics</span>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Link href="/pricing" className="flex-1">
              <Button className="w-full">Upgrade Now</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
