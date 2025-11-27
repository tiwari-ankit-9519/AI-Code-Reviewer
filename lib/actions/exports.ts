"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface Recommendation {
  priority: number;
  category: string;
  title: string;
  impact: string;
  effort: "low" | "medium" | "high";
}

type IssueType = Awaited<ReturnType<typeof prisma.issue.findMany>>[number];

export async function exportAnalysisJSON(submissionId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const submission = await prisma.codeSubmission.findUnique({
    where: { id: submissionId },
    include: { analysis: true, issues: true },
  });

  if (!submission || submission.userId !== session.user.id) {
    throw new Error("Not found");
  }

  return {
    submission: {
      id: submission.id,
      fileName: submission.fileName,
      language: submission.language,
      linesOfCode: submission.linesOfCode,
      fileSize: submission.fileSize,
      createdAt: submission.createdAt,
      code: submission.code,
    },
    analysis: submission.analysis,
    issues: submission.issues,
  };
}

export async function exportAnalysisMarkdown(submissionId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const submission = await prisma.codeSubmission.findUnique({
    where: { id: submissionId },
    include: { analysis: true, issues: true },
  });

  if (!submission || submission.userId !== session.user.id) {
    throw new Error("Not found");
  }

  const analysis = submission.analysis;
  if (!analysis) {
    throw new Error("Analysis not available");
  }

  const groupedIssues = submission.issues.reduce<Record<string, IssueType[]>>(
    (acc, issue) => {
      if (!acc[issue.severity]) acc[issue.severity] = [];
      acc[issue.severity].push(issue);
      return acc;
    },
    {}
  );

  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };

  let recommendations: Recommendation[] = [];
  if (Array.isArray(analysis.recommendations)) {
    try {
      recommendations = (
        analysis.recommendations as unknown as Recommendation[]
      ).map((rec) => ({
        priority: rec.priority,
        category: rec.category,
        title: rec.title,
        impact: rec.impact,
        effort: rec.effort,
      }));
    } catch {
      recommendations = [];
    }
  }

  let markdown = `# Code Analysis Report

## File Information
- **File Name:** ${submission.fileName || "Untitled"}
- **Language:** ${submission.language}
- **Lines of Code:** ${submission.linesOfCode}
- **File Size:** ${(submission.fileSize / 1024).toFixed(1)}KB
- **Analysis Date:** ${new Date(submission.createdAt).toLocaleString()}

## Overall Scores

| Category | Score |
|----------|-------|
| Overall | ${analysis.overallScore}% |
| Security | ${analysis.securityScore}% |
| Performance | ${analysis.performanceScore}% |
| Quality | ${analysis.qualityScore}% |
| Maintainability | ${analysis.maintainabilityScore}% |

## Summary

${analysis.summary}

## Issues Found

Total Issues: ${submission.issues.length}

`;

  Object.entries(groupedIssues)
    .sort(([a], [b]) => severityOrder[a] - severityOrder[b])
    .forEach(([severity, issues]) => {
      markdown += `\n### ${
        severity.charAt(0).toUpperCase() + severity.slice(1)
      } (${issues.length})\n\n`;

      issues.forEach((issue, index) => {
        markdown += `#### ${index + 1}. ${issue.title}\n`;
        markdown += `**Severity:** ${issue.severity.toUpperCase()}\n`;
        markdown += `**Line:** ${issue.lineStart}${
          issue.lineEnd !== issue.lineStart ? `-${issue.lineEnd}` : ""
        }\n`;
        markdown += `**Type:** ${issue.type}\n\n`;
        markdown += `${issue.description}\n\n`;

        if (issue.cweId) {
          markdown += `**CWE Reference:** ${issue.cweId}\n\n`;
        }

        markdown += `\`\`\`${submission.language}\n${issue.codeSnippet}\n\`\`\`\n\n`;

        if (issue.suggestedFix) {
          markdown += `**Suggested Fix:**\n${issue.suggestedFix}\n\n`;
        }

        if (issue.fixedCode) {
          markdown += `**Fixed Code:**\n\`\`\`${submission.language}\n${issue.fixedCode}\n\`\`\`\n\n`;
        }

        markdown += "---\n\n";
      });
    });

  markdown += `## Recommendations\n\n`;

  recommendations.forEach((rec, index) => {
    markdown += `${index + 1}. **${rec.title}**\n`;
    markdown += `   - Priority: ${rec.priority}/5\n`;
    markdown += `   - Category: ${rec.category}\n`;
    markdown += `   - Impact: ${rec.impact}\n`;
    markdown += `   - Effort: ${rec.effort}\n\n`;
  });

  markdown += `## Analysis Metadata\n\n`;
  markdown += `- **AI Model:** ${analysis.aiModel}\n`;
  markdown += `- **AI Provider:** ${analysis.aiProvider}\n`;
  markdown += `- **Prompt Tokens:** ${analysis.promptTokens}\n`;
  markdown += `- **Completion Tokens:** ${analysis.completionTokens}\n`;
  markdown += `- **Analysis Time:** ${analysis.analysisTime}ms\n`;

  return markdown;
}
