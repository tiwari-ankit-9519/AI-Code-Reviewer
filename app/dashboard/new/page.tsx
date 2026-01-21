// app/dashboard/new/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { createSubmission } from "@/lib/actions/submissions";
import { getUsageData } from "@/lib/actions/usage";
import {
  ArrowLeft,
  FileCode,
  Send,
  AlertCircle,
  Zap,
  CheckCircle,
  Loader2,
  Upload,
  File,
  X,
} from "lucide-react";

interface UsageData {
  tier: string;
  used: number;
  limit: number | string;
  remaining: number;
  percentage: number;
  maxFileSize: number;
  maxFileSizeLabel: string;
}

export default function NewSubmissionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fileName: "",
    language: "javascript",
    code: "",
  });

  useEffect(() => {
    async function loadUsageData() {
      try {
        const data = await getUsageData();
        setUsageData(data);
      } catch (error) {
        console.error("Failed to load usage data:", error);
        toast.error("Failed to load usage data");
      } finally {
        setLoading(false);
      }
    }

    loadUsageData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!usageData) {
      toast.error("Usage data not loaded");
      return;
    }

    if (file.size > usageData.maxFileSize) {
      toast.error(
        `File size exceeds ${usageData.maxFileSizeLabel} limit for ${usageData.tier} tier`,
        {
          description: `Your file is ${(file.size / 1024).toFixed(2)}KB. Upgrade to increase file size limit.`,
        },
      );
      return;
    }

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const code = event.target?.result as string;
      const extension = file.name.split(".").pop()?.toLowerCase();

      const languageMap: Record<string, string> = {
        js: "javascript",
        jsx: "javascript",
        ts: "typescript",
        tsx: "typescript",
        py: "python",
        java: "java",
        cpp: "cpp",
        cc: "cpp",
        cxx: "cpp",
        cs: "csharp",
        go: "go",
        rs: "rust",
        php: "php",
        rb: "ruby",
        swift: "swift",
        kt: "kotlin",
      };

      const detectedLanguage = languageMap[extension || ""] || "javascript";

      setFormData({
        fileName: file.name,
        language: detectedLanguage,
        code,
      });

      toast.success(`File loaded: ${file.name}`);
    };

    reader.onerror = () => {
      toast.error("Failed to read file");
    };

    reader.readAsText(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFormData({
      fileName: "",
      language: "javascript",
      code: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usageData) {
      toast.error("Usage data not loaded");
      return;
    }

    if (!formData.code.trim()) {
      toast.error("Please provide code to analyze");
      return;
    }

    const codeSize = new Blob([formData.code]).size;
    if (codeSize > usageData.maxFileSize) {
      toast.error(
        `Code size exceeds ${usageData.maxFileSizeLabel} limit for ${usageData.tier} tier`,
        {
          description: `Your code is ${(codeSize / 1024).toFixed(2)}KB. Upgrade to increase file size limit.`,
        },
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("code", formData.code);
      formDataObj.append("language", formData.language);
      formDataObj.append(
        "fileName",
        formData.fileName || `untitled.${formData.language}`,
      );

      const result = await createSubmission(formDataObj);

      toast.success("Code submitted successfully!", {
        description: "Your code is being reviewed by AI",
      });
      router.push(`/dashboard/submissions/${result.id}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit code";
      const errorName = error instanceof Error ? error.name : "";

      if (
        errorName === "CoolingPeriodError" ||
        errorMessage.includes("cooling period") ||
        errorMessage.includes("wait")
      ) {
        toast.error("Cooling Period Active", {
          description: errorMessage,
        });
      } else if (
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

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const canSubmit =
    usageData && (usageData.remaining > 0 || usageData.limit === "unlimited");

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
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

      {usageData && usageData.tier === "STARTER" && canSubmit && (
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-600 dark:text-blue-400">
            {usageData.remaining} / {usageData.limit} submissions remaining
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 mb-3">
              <Progress value={usageData.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(usageData.percentage)}% used
              </p>
            </div>
            {usageData.percentage >= 80 && (
              <Link href="/dashboard/subscription">
                <Button size="sm" className="mt-2">
                  Upgrade to Hero
                </Button>
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!canSubmit ? (
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
                You&apos;ve used all {usageData?.limit} submissions this month.
                Upgrade to Hero for unlimited submissions!
              </p>
            </div>
            <div className="space-y-2">
              <Link href="/dashboard/subscription">
                <Button size="lg" className="w-full sm:w-auto">
                  Upgrade to Hero - ₹2999/month
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload or Paste Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>File Upload (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.cs,.go,.rs,.php,.rb,.swift,.kt"
                    className="hidden"
                  />
                  {uploadedFile && (
                    <div className="flex items-center gap-2 text-sm">
                      <File className="h-4 w-4" />
                      <span className="font-medium">{uploadedFile.name}</span>
                      <span className="text-muted-foreground">
                        ({(uploadedFile.size / 1024).toFixed(2)}KB)
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: {usageData?.maxFileSizeLabel} (
                  {usageData?.tier} tier)
                </p>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Textarea
                  id="code"
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleInputChange}
                  rows={15}
                  placeholder="Paste your code here or upload a file above..."
                  className="font-mono text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Current size:{" "}
                  {(new Blob([formData.code]).size / 1024).toFixed(2)}KB /{" "}
                  {usageData?.maxFileSizeLabel}
                </p>
              </div>
            </CardContent>
          </Card>

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
              <span>100KB file size limit</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span>Priority AI reviews</span>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Link href="/dashboard/subscription" className="flex-1">
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
