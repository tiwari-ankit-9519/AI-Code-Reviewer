/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeCode } from "@/lib/ai/code-analyzer";
import { revalidatePath } from "next/cache";
import {
  canUserSubmit,
  incrementSubmissionCount,
  checkSubmissionThreshold,
  getUserSubscription,
} from "@/lib/subscription/subscription-utils";
import {
  trackSubmissionCreated,
  trackLimitWarningSent,
} from "@/lib/analytics/subscription-events";
import {
  checkCoolingPeriodStatus,
  canStartNewSession,
  getActiveSession,
  startReviewSession,
  incrementSessionReviews,
} from "@/lib/services/review-session-service";
import {
  handleConcurrentSubmissionAttempt,
  handleFailedSubmission,
  handleMidnightBoundary,
  cleanupOrphanedData,
} from "@/lib/services/edge-case-handlers";
import { validateFileSize } from "@/lib/services/file-size-limits";
import { CoolingPeriodError } from "@/lib/errors/submission-errors";

export async function createSubmission(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await cleanupOrphanedData(session.user.id);

  await handleMidnightBoundary(session.user.id);

  const code = formData.get("code") as string;
  const language = formData.get("language") as string;
  const fileName = formData.get("fileName") as string | null;

  if (!code || !language) {
    throw new Error("Code and language are required");
  }

  const fileSize = new Blob([code]).size;
  const linesOfCode = code.split("\n").length;

  const subscription = await getUserSubscription(session.user.id);

  const fileSizeCheck = validateFileSize(
    fileSize,
    subscription.subscriptionTier
  );
  if (!fileSizeCheck.valid) {
    throw new Error(fileSizeCheck.message);
  }

  const coolingStatus = await checkCoolingPeriodStatus(session.user.id);
  if (coolingStatus.isInCoolingPeriod) {
    throw new CoolingPeriodError(
      `Please wait ${coolingStatus.hoursRemaining} hours before submitting again`,
      coolingStatus.endsAt!,
      coolingStatus.hoursRemaining
    );
  }

  const canStart = await canStartNewSession(session.user.id);
  if (!canStart.allowed) {
    throw new Error(canStart.reason);
  }

  const limitCheck = await canUserSubmit(session.user.id);
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.reason);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentSessionId: true },
  });

  const concurrentCheck = await handleConcurrentSubmissionAttempt(
    session.user.id,
    user?.currentSessionId || null
  );

  if (!concurrentCheck.canProceed) {
    throw new Error(concurrentCheck.reason || "Cannot proceed with submission");
  }

  let submissionId: string | null = null;
  let sessionIdForRollback: string | null = null;

  try {
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

    submissionId = submission.id;

    if (subscription.subscriptionTier === "HERO") {
      const activeSession = await getActiveSession(session.user.id);
      if (activeSession) {
        await incrementSessionReviews(session.user.id, activeSession.id);
        sessionIdForRollback = activeSession.id;
      } else {
        const newSession = await startReviewSession(session.user.id);
        sessionIdForRollback = newSession.sessionId;
      }
    }

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
  } catch (error) {
    if (submissionId && sessionIdForRollback) {
      await handleFailedSubmission(session.user.id, sessionIdForRollback, true);
    }
    throw error;
  }
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
        const { id: _id, ...issueData } = issue;
        return { ...issueData, submissionId };
      }),
      ...analysis.performanceIssues.map((issue) => {
        const { id: _id, ...issueData } = issue;
        return { ...issueData, submissionId };
      }),
      ...analysis.codeSmells.map((issue) => {
        const { id: _id, ...issueData } = issue;
        return { ...issueData, submissionId };
      }),
      ...analysis.bugRisks.map((issue) => {
        const { id: _id, ...issueData } = issue;
        return { ...issueData, submissionId };
      }),
      ...analysis.styleSuggestions.map((issue) => {
        const { id: _id, ...issueData } = issue;
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
      ...(issues.length > 0
        ? [
            prisma.issue.createMany({
              data: issues,
            }),
          ]
        : []),
      prisma.codeSubmission.update({
        where: { id: submissionId },
        data: { status: "completed" },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/submissions");
    revalidatePath(`/dashboard/submissions/${submissionId}`);
  } catch (error) {
    console.error("Analysis error:", error);
    await prisma.codeSubmission.update({
      where: { id: submissionId },
      data: { status: "failed" },
    });
    throw error;
  }
}

export async function deleteSubmission(submissionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const submission = await prisma.codeSubmission.findUnique({
    where: { id: submissionId },
    select: { userId: true },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.codeSubmission.delete({
    where: { id: submissionId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/submissions");

  return { success: true };
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
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  return {
    status: submission.status,
  };
}
