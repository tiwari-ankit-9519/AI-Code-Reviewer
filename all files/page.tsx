import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AnalysisProgress } from "@/components/analysis-progress";
import { ExportButtons } from "@/components/export-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Shield,
  Zap,
  CheckCircle,
  Wrench,
  Star,
  FileCode,
  Calendar,
  Code,
  HardDrive,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  CheckSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!id) {
    notFound();
  }

  const submission = await prisma.codeSubmission.findUnique({
    where: { id },
    include: {
      analysis: true,
      issues: {
        orderBy: [{ severity: "asc" }, { lineStart: "asc" }],
      },
    },
  });

  if (!submission) {
    notFound();
  }

  if (submission.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: "secondary" as const, icon: AlertCircle },
      analyzing: { variant: "default" as const, icon: Zap },
      completed: { variant: "outline" as const, icon: CheckCircle },
      failed: { variant: "destructive" as const, icon: AlertTriangle },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/50";
    if (score >= 60) return "bg-blue-500/10 border-blue-500/50";
    if (score >= 40) return "bg-amber-500/10 border-amber-500/50";
    return "bg-red-500/10 border-red-500/50";
  };

  const getSeverityConfig = (severity: string) => {
    const config = {
      critical: {
        variant: "destructive" as const,
        className: "bg-red-500/10 border-red-500/50 text-black uppercase",
      },
      high: {
        variant: "destructive" as const,
        className: "bg-orange-500/10 border-orange-500/50 text-black uppercase",
      },
      medium: {
        variant: "default" as const,
        className: "bg-amber-200/10 border-amber-500/50 text-black uppercase",
      },
      low: {
        variant: "secondary" as const,
        className: "bg-blue-500/10 border-blue-500/50 text-black uppercase",
      },
      info: {
        variant: "outline" as const,
        className: "bg-muted/50 text-black uppercase",
      },
    };
    return config[severity as keyof typeof config] || config.info;
  };

  type IssueItem = (typeof submission.issues)[number];
  type IssueGroup = Record<string, IssueItem[]>;

  const groupedIssues: IssueGroup = submission.issues.reduce(
    (acc: IssueGroup, issue: IssueItem) => {
      if (!acc[issue.severity]) {
        acc[issue.severity] = [];
      }
      acc[issue.severity].push(issue);
      return acc;
    },
    {} as IssueGroup
  );

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

  const statusConfig = getStatusBadge(submission.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="space-y-3">
          <Link href="/dashboard/submissions">
            <Button variant="ghost" className="gap-2 group -ml-2">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Submissions
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex items-center gap-3">
            <FileCode className="h-10 w-10 text-primary" />
            {submission.fileName || "Untitled"}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <Badge variant="outline" className="gap-1">
              <Code className="h-3 w-3" />
              {submission.language}
            </Badge>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              {submission.linesOfCode} lines
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {(submission.fileSize / 1024).toFixed(1)}KB
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(submission.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={statusConfig.variant}
            className="px-4 py-2 text-sm gap-2"
          >
            <StatusIcon className="h-4 w-4" />
            {submission.status.charAt(0).toUpperCase() +
              submission.status.slice(1)}
          </Badge>
          {submission.analysis && (
            <ExportButtons submissionId={submission.id} />
          )}
        </div>
      </div>

      {/* Analysis Progress */}
      {(submission.status === "pending" ||
        submission.status === "analyzing") && (
        <AnalysisProgress submissionId={submission.id} />
      )}

      {/* Analysis Results */}
      {submission.analysis ? (
        <>
          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card
              className={`border-2 ${getScoreBg(
                submission.analysis.overallScore
              )} hover:scale-105 transition-transform duration-300`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Overall
                  </p>
                </div>
                <p
                  className={`text-5xl font-bold ${getScoreColor(
                    submission.analysis.overallScore
                  )}`}
                >
                  {submission.analysis.overallScore}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Security
                  </p>
                </div>
                <p
                  className={`text-5xl font-bold ${getScoreColor(
                    submission.analysis.securityScore
                  )}`}
                >
                  {submission.analysis.securityScore}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Performance
                  </p>
                </div>
                <p
                  className={`text-5xl font-bold ${getScoreColor(
                    submission.analysis.performanceScore
                  )}`}
                >
                  {submission.analysis.performanceScore}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quality
                  </p>
                </div>
                <p
                  className={`text-5xl font-bold ${getScoreColor(
                    submission.analysis.qualityScore
                  )}`}
                >
                  {submission.analysis.qualityScore}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:scale-105 transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-cyan-500" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Maintainability
                  </p>
                </div>
                <p
                  className={`text-5xl font-bold ${getScoreColor(
                    submission.analysis.maintainabilityScore
                  )}`}
                >
                  {submission.analysis.maintainabilityScore}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-6 w-6 text-primary" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {submission.analysis.summary}
              </p>
            </CardContent>
          </Card>

          {/* Issues Section */}
          {submission.issues.length > 0 && (
            <Card className="border-2 border-destructive/50">
              <CardHeader className="bg-destructive/5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    Issues Found ({submission.issues.length})
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(groupedIssues)
                      .sort(
                        ([a], [b]) =>
                          severityOrder[a as keyof typeof severityOrder] -
                          severityOrder[b as keyof typeof severityOrder]
                      )
                      .map(([severity, issues]) => {
                        const config = getSeverityConfig(severity);
                        return (
                          <Badge
                            key={severity}
                            variant={config.variant}
                            className="gap-1"
                          >
                            {severity}: {issues.length}
                          </Badge>
                        );
                      })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {Object.entries(groupedIssues)
                    .sort(
                      ([a], [b]) =>
                        severityOrder[a as keyof typeof severityOrder] -
                        severityOrder[b as keyof typeof severityOrder]
                    )
                    .map(([severity, issues]) => (
                      <div key={severity}>
                        {issues.map((issue, index) => {
                          const config = getSeverityConfig(issue.severity);
                          return (
                            <div
                              key={issue.id}
                              className="p-6 hover:bg-muted/50 transition-colors animate-in slide-in-from-left duration-500"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                      variant={config.variant}
                                      className={`gap-1 ${config.className}`}
                                    >
                                      <AlertCircle className="h-3 w-3" />
                                      {issue.severity}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="gap-1"
                                    >
                                      <Code className="h-3 w-3" />
                                      Line {issue.lineStart}
                                      {issue.lineEnd !== issue.lineStart &&
                                        `-${issue.lineEnd}`}
                                    </Badge>
                                    {issue.cweId && (
                                      <Badge variant="outline">
                                        {issue.cweId}
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-bold">
                                    {issue.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {issue.description}
                                  </p>
                                </div>
                              </div>

                              {/* Problem Code */}
                              <Card className="mb-4 border-destructive/50">
                                <CardHeader className="bg-destructive/5 py-3">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    Problem Code
                                  </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                  <SyntaxHighlighter
                                    language={submission.language}
                                    style={vscDarkPlus}
                                    showLineNumbers
                                    startingLineNumber={issue.lineStart}
                                    customStyle={{
                                      margin: 0,
                                      fontSize: "13px",
                                      background: "#1e1e1e",
                                    }}
                                  >
                                    {issue.codeSnippet}
                                  </SyntaxHighlighter>
                                </CardContent>
                              </Card>

                              {/* Suggested Fix */}
                              {issue.suggestedFix && (
                                <Card className="mb-4 border-emerald-500/50 bg-emerald-500/5">
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                      <Lightbulb className="h-5 w-5 text-emerald-500 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                                          Suggested Fix
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {issue.suggestedFix}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Fixed Code */}
                              {issue.fixedCode && (
                                <Card className="border-emerald-500/50">
                                  <CardHeader className="bg-emerald-500/5 py-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                      <CheckSquare className="h-4 w-4" />
                                      Fixed Code
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-0">
                                    <SyntaxHighlighter
                                      language={submission.language}
                                      style={vscDarkPlus}
                                      showLineNumbers
                                      startingLineNumber={issue.lineStart}
                                      customStyle={{
                                        margin: 0,
                                        fontSize: "13px",
                                        background: "#1e1e1e",
                                      }}
                                    >
                                      {issue.fixedCode}
                                    </SyntaxHighlighter>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      {/* Code Display */}
      <Card className="border-2 overflow-hidden">
        <CardHeader className="bg-muted/50 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <FileCode className="h-3 w-3" />
              {submission.fileName || `untitled.${submission.language}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto">
            <SyntaxHighlighter
              language={submission.language}
              style={vscDarkPlus}
              showLineNumbers
              wrapLines
              customStyle={{
                margin: 0,
                fontSize: "13px",
                background: "#1e1e1e",
              }}
            >
              {submission.code}
            </SyntaxHighlighter>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
