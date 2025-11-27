import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AnalysisProgress } from "@/components/analysis-progress";

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
    const styles = {
      pending: "bg-gray-100 text-gray-700 border-gray-200",
      analyzing: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      failed: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-blue-50";
    if (score >= 40) return "bg-yellow-50";
    return "bg-red-50";
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-blue-100 text-blue-800 border-blue-200",
      info: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[severity as keyof typeof styles] || styles.info;
  };

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const groupedIssues = submission.issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) {
      acc[issue.severity] = [];
    }
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<string, typeof submission.issues>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/submissions"
            className="text-sm text-[#007fff] hover:text-[#005ecb] font-medium mb-2 inline-block"
          >
            ← Back to History
          </Link>
          <h1 className="text-3xl font-bold text-[#15192c]">
            {submission.fileName || "Untitled"}
          </h1>
          <p className="text-[#6c7681] mt-2">
            {submission.language} • {submission.linesOfCode} lines •{" "}
            {(submission.fileSize / 1024).toFixed(1)}KB •{" "}
            {new Date(submission.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusBadge(
            submission.status
          )}`}
        >
          {submission.status.charAt(0).toUpperCase() +
            submission.status.slice(1)}
        </span>
      </div>

      {(submission.status === "pending" ||
        submission.status === "analyzing") && (
        <AnalysisProgress submissionId={submission.id} />
      )}

      {submission.analysis ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div
              className={`${getScoreBg(
                submission.analysis.overallScore
              )} rounded-lg border border-[#ececec] p-4`}
            >
              <p className="text-xs font-medium text-[#6c7681] uppercase tracking-wider mb-1">
                Overall
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  submission.analysis.overallScore
                )}`}
              >
                {submission.analysis.overallScore}%
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[#ececec] p-4">
              <p className="text-xs font-medium text-[#6c7681] uppercase tracking-wider mb-1">
                Security
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  submission.analysis.securityScore
                )}`}
              >
                {submission.analysis.securityScore}%
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[#ececec] p-4">
              <p className="text-xs font-medium text-[#6c7681] uppercase tracking-wider mb-1">
                Performance
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  submission.analysis.performanceScore
                )}`}
              >
                {submission.analysis.performanceScore}%
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[#ececec] p-4">
              <p className="text-xs font-medium text-[#6c7681] uppercase tracking-wider mb-1">
                Quality
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  submission.analysis.qualityScore
                )}`}
              >
                {submission.analysis.qualityScore}%
              </p>
            </div>

            <div className="bg-white rounded-lg border border-[#ececec] p-4">
              <p className="text-xs font-medium text-[#6c7681] uppercase tracking-wider mb-1">
                Maintainability
              </p>
              <p
                className={`text-3xl font-bold ${getScoreColor(
                  submission.analysis.maintainabilityScore
                )}`}
              >
                {submission.analysis.maintainabilityScore}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#15192c] mb-3">
              Summary
            </h2>
            <p className="text-[#6c7681] leading-relaxed">
              {submission.analysis.summary}
            </p>
          </div>

          {submission.issues.length > 0 && (
            <div className="bg-white rounded-lg border border-[#ececec] shadow-sm">
              <div className="px-6 py-4 border-b border-[#ececec] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#15192c]">
                  Issues Found ({submission.issues.length})
                </h2>
                <div className="flex gap-2">
                  {Object.entries(groupedIssues)
                    .sort(
                      ([a], [b]) =>
                        severityOrder[a as keyof typeof severityOrder] -
                        severityOrder[b as keyof typeof severityOrder]
                    )
                    .map(([severity, issues]) => (
                      <span
                        key={severity}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(
                          severity
                        )}`}
                      >
                        {severity}: {issues.length}
                      </span>
                    ))}
                </div>
              </div>

              <div className="divide-y divide-[#ececec]">
                {Object.entries(groupedIssues)
                  .sort(
                    ([a], [b]) =>
                      severityOrder[a as keyof typeof severityOrder] -
                      severityOrder[b as keyof typeof severityOrder]
                  )
                  .map(([severity, issues]) => (
                    <div key={severity}>
                      {issues.map((issue) => (
                        <div key={issue.id} className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityBadge(
                                    issue.severity
                                  )}`}
                                >
                                  {issue.severity.toUpperCase()}
                                </span>
                                <span className="text-xs text-[#b2b5be]">
                                  Line {issue.lineStart}
                                  {issue.lineEnd !== issue.lineStart &&
                                    `-${issue.lineEnd}`}
                                </span>
                                {issue.cweId && (
                                  <span className="text-xs text-[#b2b5be]">
                                    {issue.cweId}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-semibold text-[#15192c] mb-2">
                                {issue.title}
                              </h3>
                              <p className="text-sm text-[#6c7681]">
                                {issue.description}
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#1e1e1e] rounded-lg overflow-hidden mb-3">
                            <div className="bg-[#252526] px-4 py-2 border-b border-[#2d2d2d]">
                              <p className="text-xs text-gray-400">
                                Problem Code
                              </p>
                            </div>
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
                          </div>

                          {issue.suggestedFix && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                              <p className="text-sm font-medium text-green-900 mb-2">
                                💡 Suggested Fix
                              </p>
                              <p className="text-sm text-green-800">
                                {issue.suggestedFix}
                              </p>
                            </div>
                          )}

                          {issue.fixedCode && (
                            <div className="bg-[#1e1e1e] rounded-lg overflow-hidden">
                              <div className="bg-[#252526] px-4 py-2 border-b border-[#2d2d2d]">
                                <p className="text-xs text-green-400">
                                  ✓ Fixed Code
                                </p>
                              </div>
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
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      <div className="bg-white rounded-lg border border-[#ececec] shadow-sm overflow-hidden">
        <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b border-[#2d2d2d]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {submission.fileName || `untitled.${submission.language}`}
          </span>
        </div>
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
      </div>
    </div>
  );
}
