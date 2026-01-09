// app/dashboard/submissions/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileCode,
  Calendar,
  Code,
  HardDrive,
  ChevronRight,
  Shield,
  Zap,
  Sparkles,
  Clock,
  TrendingUp,
} from "lucide-react";

export default async function SubmissionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      monthlySubmissionCount: true,
    },
  });

  if (!user) {
    return null;
  }

  const submissions = await prisma.codeSubmission.findMany({
    where: { userId: session.user.id },
    include: {
      analysis: {
        select: {
          overallScore: true,
          securityScore: true,
          performanceScore: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSubmissions = submissions.length;
  const isStarter = user.subscriptionTier === "STARTER";

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 group -ml-2">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <FileCode className="h-10 w-10 text-primary" />
              All Submissions
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              View and manage your code reviews
            </p>
          </div>

          <Link href="/dashboard/submissions/new">
            <Button size="lg" className="gap-2 group shadow-lg">
              <Sparkles className="h-5 w-5" />
              New Review
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Total: <span className="font-bold ml-1">{totalSubmissions}</span>
          </Badge>
          {isStarter && (
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
            >
              <Clock className="h-4 w-4 mr-2" />
              {user.monthlySubmissionCount}/5 used this month
            </Badge>
          )}
        </div>
      </div>

      {/* Empty State */}
      {submissions.length === 0 && isStarter ? (
        <Card className="border-2 hover:border-primary/50 transition-all duration-300">
          <CardContent className="p-12 text-center">
            <div className="rounded-full bg-primary/10 p-6 w-24 h-24 mx-auto mb-6 animate-pulse">
              <FileCode className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-3xl font-bold mb-4">No Submissions Yet</h3>
            <p className="text-muted-foreground mb-2 text-lg">
              You have{" "}
              <span className="text-primary font-bold">
                {5 - user.monthlySubmissionCount}
              </span>{" "}
              free submissions remaining
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              Start your coding journey now!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/submissions/new">
                <Button size="lg" className="gap-2 group">
                  <Sparkles className="h-5 w-5" />
                  Start First Review
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 group border-2"
                >
                  <Zap className="h-5 w-5" />
                  Get Unlimited
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : submissions.length === 0 ? (
        <Card className="border-2 hover:border-primary/50 transition-all duration-300">
          <CardContent className="p-12 text-center">
            <div className="rounded-full bg-primary/10 p-6 w-24 h-24 mx-auto mb-6 animate-pulse">
              <FileCode className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-3xl font-bold mb-4">No Submissions Yet</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Start your coding journey now!
            </p>
            <Link href="/dashboard/submissions/new">
              <Button size="lg" className="gap-2 group">
                <Sparkles className="h-5 w-5" />
                Start Review
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map((submission, index) => (
            <Link
              key={submission.id}
              href={`/dashboard/submissions/${submission.id}`}
              className="block animate-in slide-in-from-left duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] group">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left Section - File Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <FileCode className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                          {submission.fileName || "Untitled"}
                        </h3>
                        <Badge variant="outline" className="font-semibold">
                          {submission.language}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(submission.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          {submission.linesOfCode} lines
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          {(submission.fileSize / 1024).toFixed(1)}KB
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Scores */}
                    <div className="flex items-center gap-6">
                      {submission.analysis ? (
                        <div className="flex items-center gap-6">
                          {/* Overall Score */}
                          <div className="text-center">
                            <div
                              className={`text-5xl font-bold ${getScoreColor(
                                submission.analysis.overallScore
                              )} mb-2`}
                            >
                              {submission.analysis.overallScore}%
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              Overall
                            </p>
                          </div>

                          {/* Sub-scores */}
                          <div className="flex flex-col gap-2">
                            <Badge
                              variant="outline"
                              className={`${getScoreBg(
                                submission.analysis.securityScore
                              )} border-2 justify-start gap-2`}
                            >
                              <Shield className="h-3 w-3" />
                              Security: {submission.analysis.securityScore}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${getScoreBg(
                                submission.analysis.performanceScore
                              )} border-2 justify-start gap-2`}
                            >
                              <Zap className="h-3 w-3" />
                              Performance:{" "}
                              {submission.analysis.performanceScore}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="px-4 py-2 text-sm animate-pulse border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                        >
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </Badge>
                      )}

                      {/* Arrow */}
                      <ChevronRight className="h-8 w-8 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
