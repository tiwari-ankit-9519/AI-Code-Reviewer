"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getDashboardStats() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [
    totalSubmissions,
    pendingSubmissions,
    completedSubmissions,
    failedSubmissions,
    recentSubmissions,
    issueStats,
  ] = await Promise.all([
    prisma.codeSubmission.count({
      where: { userId: session.user.id },
    }),
    prisma.codeSubmission.count({
      where: { userId: session.user.id, status: "pending" },
    }),
    prisma.codeSubmission.count({
      where: { userId: session.user.id, status: "completed" },
    }),
    prisma.codeSubmission.count({
      where: { userId: session.user.id, status: "failed" },
    }),
    prisma.codeSubmission.findMany({
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
      take: 5,
    }),
    prisma.issue.groupBy({
      by: ["severity"],
      where: {
        submission: {
          userId: session.user.id,
        },
      },
      _count: true,
    }),
  ]);

  const languageStats = await prisma.codeSubmission.groupBy({
    by: ["language"],
    where: { userId: session.user.id },
    _count: true,
  });

  const avgScores = await prisma.analysisResult.aggregate({
    where: {
      submission: {
        userId: session.user.id,
      },
    },
    _avg: {
      overallScore: true,
      securityScore: true,
      performanceScore: true,
      qualityScore: true,
      maintainabilityScore: true,
    },
  });

  const issuesBySeverity = {
    critical: issueStats.find((s) => s.severity === "critical")?._count || 0,
    high: issueStats.find((s) => s.severity === "high")?._count || 0,
    medium: issueStats.find((s) => s.severity === "medium")?._count || 0,
    low: issueStats.find((s) => s.severity === "low")?._count || 0,
    info: issueStats.find((s) => s.severity === "info")?._count || 0,
  };

  return {
    totalSubmissions,
    pendingSubmissions,
    completedSubmissions,
    failedSubmissions,
    recentSubmissions,
    languageStats,
    avgScores: {
      overall: Math.round(avgScores._avg.overallScore || 0),
      security: Math.round(avgScores._avg.securityScore || 0),
      performance: Math.round(avgScores._avg.performanceScore || 0),
      quality: Math.round(avgScores._avg.qualityScore || 0),
      maintainability: Math.round(avgScores._avg.maintainabilityScore || 0),
    },
    issuesBySeverity,
    totalIssues: Object.values(issuesBySeverity).reduce((a, b) => a + b, 0),
  };
}
