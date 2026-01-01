/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { analyzeCode } from "@/lib/ai/code-analyzer";
import { revalidatePath } from "next/cache";
import {
  canUserSubmit,
  checkAndResetIfNeeded,
  getUserSubscription,
  getTierLimits,
  incrementSubmissionCount,
  checkSubmissionThreshold,
} from "@/lib/subscription/subscription-utils";
import { SubmissionLimitError } from "@/lib/errors/submission-errors";
import {
  trackSubmissionCreated,
  trackLimitReached,
  trackLimitWarningSent,
} from "@/lib/analytics/subscription-events";

export async function submitCode(formData: {
  code: string;
  language: string;
  fileName: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const submissionCheck = await canUserSubmit(session.user.id);

  if (!submissionCheck.allowed) {
    await trackLimitReached(session.user.id, submissionCheck.tier || "STARTER");

    throw new SubmissionLimitError({
      message: submissionCheck.reason || "Submission limit reached",
      currentCount: submissionCheck.currentCount,
      limit: submissionCheck.limit,
      tier: submissionCheck.tier,
      isInTrial: submissionCheck.isInTrial,
    });
  }

  await checkAndResetIfNeeded(session.user.id);

  const { code, language, fileName } = formData;

  if (!code || !code.trim()) {
    throw new Error("Code is required");
  }

  const subscription = await getUserSubscription(session.user.id);
  const tierLimits = getTierLimits(subscription.subscriptionTier);
  const fileSize = new TextEncoder().encode(code).length;

  if (tierLimits.maxFileSize !== -1 && fileSize > tierLimits.maxFileSize) {
    throw new Error(
      `File size exceeds ${tierLimits.maxFileSize / 1024}KB limit for ${
        subscription.subscriptionTier
      } tier`
    );
  }

  const linesOfCode = code.split("\n").length;

  const submission = await prisma.codeSubmission.create({
    data: {
      code,
      language,
      fileName: fileName || `untitled.${language}`,
      fileSize,
      linesOfCode,
      status: "pending",
      userId: session.user.id,
    },
  });

  await incrementSubmissionCount(session.user.id);

  await trackSubmissionCreated(
    session.user.id,
    submission.id,
    subscription.subscriptionTier
  );

  const threshold = await checkSubmissionThreshold(session.user.id);
  if (threshold.shouldNotify) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { submissionLimitNotified: true },
    });

    await trackLimitWarningSent(
      session.user.id,
      subscription.subscriptionTier,
      threshold.remaining || 0
    );
  }

  await runAnalysisAndRevalidate(submission.id, code, language);

  return {
    success: true,
    id: submission.id,
    code,
    language,
  };
}

export async function runAnalysisAndRevalidate(
  submissionId: string,
  code: string,
  language: string
) {
  try {
    await prisma.codeSubmission.update({
      where: { id: submissionId },
      data: { status: "analyzing" },
    });

    const analysis = await analyzeCode(code, language);

    const issues = [
      ...analysis.securityIssues.map((issue) => {
        const { id, ...issueData } = issue;
        return { ...issueData, submissionId };
      }),
      ...analysis.performanceIssues.map((issue) => {
        const { id, ...issueData } = issue;
        return { ...issueData, submissionId };
      }),
      ...analysis.codeSmells.map((issue) => {
        const { id, ...issueData } = issue;
        return { ...issueData, submissionId };
      }),
      ...analysis.bugRisks.map((issue) => {
        const { id, ...issueData } = issue;
        return { ...issueData, submissionId };
      }),
      ...analysis.styleSuggestions.map((issue) => {
        const { id, ...issueData } = issue;
        return { ...issueData, submissionId };
      }),
    ];

    await prisma.$transaction([
      prisma.analysisResult.create({
        data: {
          submissionId,
          securityScore: analysis.securityScore,
          performanceScore: analysis.performanceScore,
          qualityScore: analysis.qualityScore,
          complexityScore: analysis.complexityScore,
          maintainabilityScore: analysis.maintainabilityScore,
          overallScore: analysis.overallScore,
          securityIssues: JSON.parse(JSON.stringify(analysis.securityIssues)),
          performanceIssues: JSON.parse(
            JSON.stringify(analysis.performanceIssues)
          ),
          codeSmells: JSON.parse(JSON.stringify(analysis.codeSmells)),
          bugRisks: JSON.parse(JSON.stringify(analysis.bugRisks)),
          styleSuggestions: JSON.parse(
            JSON.stringify(analysis.styleSuggestions)
          ),
          aiModel: analysis.aiModel,
          aiProvider: analysis.aiProvider,
          promptTokens: analysis.promptTokens,
          completionTokens: analysis.completionTokens,
          analysisTime: analysis.analysisTime,
          summary: analysis.summary,
          recommendations: JSON.parse(JSON.stringify(analysis.recommendations)),
        },
      }),
      prisma.issue.createMany({
        data: issues,
      }),
      prisma.codeSubmission.update({
        where: { id: submissionId },
        data: { status: "completed" },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/submissions");
    revalidatePath(`/dashboard/submissions/${submissionId}`);

    return { success: true };
  } catch (error) {
    console.error("Analysis error:", error);

    await prisma.codeSubmission.update({
      where: { id: submissionId },
      data: { status: "failed" },
    });

    revalidatePath(`/dashboard/submissions/${submissionId}`);

    throw new Error(
      `Analysis failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getSubmissionStatus(submissionId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const submission = await prisma.codeSubmission.findUnique({
    where: { id: submissionId },
    select: {
      status: true,
      userId: true,
      analysis: {
        select: {
          overallScore: true,
          securityScore: true,
          performanceScore: true,
          qualityScore: true,
        },
      },
    },
  });

  if (!submission || submission.userId !== session.user.id) {
    throw new Error("Not found");
  }

  return {
    status: submission.status,
    hasAnalysis: !!submission.analysis,
    analysis: submission.analysis,
  };
}
