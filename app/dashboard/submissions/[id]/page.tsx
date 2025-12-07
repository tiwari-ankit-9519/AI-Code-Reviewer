import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AnalysisProgress } from "@/components/analysis-progress";
import { ExportButtons } from "@/components/export-buttons";

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
      pending: "bg-gray-500/20 text-gray-300 border-gray-400/50",
      analyzing: "bg-blue-500/20 text-blue-300 border-blue-400/50",
      completed: "bg-green-500/20 text-green-300 border-green-400/50",
      failed: "bg-red-500/20 text-red-300 border-red-400/50",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/20 border-green-400";
    if (score >= 60) return "bg-blue-500/20 border-blue-400";
    if (score >= 40) return "bg-yellow-500/20 border-yellow-400";
    return "bg-red-500/20 border-red-400";
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: "bg-red-500/20 text-red-300 border-red-400",
      high: "bg-orange-500/20 text-orange-300 border-orange-400",
      medium: "bg-yellow-500/20 text-yellow-300 border-yellow-400",
      low: "bg-blue-500/20 text-blue-300 border-blue-400",
      info: "bg-gray-500/20 text-gray-300 border-gray-400",
    };
    return styles[severity as keyof typeof styles] || styles.info;
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link
            href="/dashboard/submissions"
            className="text-sm text-yellow-400 hover:text-yellow-300 font-black mb-3 inline-block font-mono transition"
          >
            ← Back to Battle History
          </Link>
          <h1
            className="text-4xl md:text-5xl font-black text-white font-mono uppercase"
            style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
          >
            {submission.fileName || "Untitled"}
          </h1>
          <p className="text-gray-400 mt-2 font-mono">
            <span className="text-purple-400 font-bold">
              {submission.language}
            </span>{" "}
            • {submission.linesOfCode} lines •{" "}
            {(submission.fileSize / 1024).toFixed(1)}KB •{" "}
            {new Date(submission.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-2 rounded-xl text-sm font-black border-2 font-mono uppercase ${getStatusBadge(
              submission.status
            )}`}
          >
            {submission.status.charAt(0).toUpperCase() +
              submission.status.slice(1)}
          </span>
          {submission.analysis && (
            <ExportButtons submissionId={submission.id} />
          )}
        </div>
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
              )} rounded-2xl border-4 p-6 shadow-xl`}
            >
              <p className="text-xs font-black uppercase tracking-wider mb-2 font-mono text-gray-300">
                ⭐ Overall
              </p>
              <p
                className={`text-4xl font-black font-mono ${getScoreColor(
                  submission.analysis.overallScore
                )}`}
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
              >
                {submission.analysis.overallScore}%
              </p>
            </div>

            <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] border-4 border-blue-500/50 rounded-2xl p-6 shadow-xl">
              <p className="text-xs font-black uppercase tracking-wider mb-2 font-mono text-gray-300">
                🔒 Security
              </p>
              <p
                className={`text-4xl font-black font-mono ${getScoreColor(
                  submission.analysis.securityScore
                )}`}
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
              >
                {submission.analysis.securityScore}%
              </p>
            </div>

            <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] border-4 border-purple-500/50 rounded-2xl p-6 shadow-xl">
              <p className="text-xs font-black uppercase tracking-wider mb-2 font-mono text-gray-300">
                ⚡ Performance
              </p>
              <p
                className={`text-4xl font-black font-mono ${getScoreColor(
                  submission.analysis.performanceScore
                )}`}
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
              >
                {submission.analysis.performanceScore}%
              </p>
            </div>

            <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] border-4 border-green-500/50 rounded-2xl p-6 shadow-xl">
              <p className="text-xs font-black uppercase tracking-wider mb-2 font-mono text-gray-300">
                ✓ Quality
              </p>
              <p
                className={`text-4xl font-black font-mono ${getScoreColor(
                  submission.analysis.qualityScore
                )}`}
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
              >
                {submission.analysis.qualityScore}%
              </p>
            </div>

            <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] border-4 border-cyan-500/50 rounded-2xl p-6 shadow-xl">
              <p className="text-xs font-black uppercase tracking-wider mb-2 font-mono text-gray-300">
                🔧 Maintainability
              </p>
              <p
                className={`text-4xl font-black font-mono ${getScoreColor(
                  submission.analysis.maintainabilityScore
                )}`}
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
              >
                {submission.analysis.maintainabilityScore}%
              </p>
            </div>
          </div>

          <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-4 font-mono uppercase flex items-center gap-2">
              <span>📋</span> Battle Summary
            </h2>
            <p className="text-gray-300 leading-relaxed font-mono">
              {submission.analysis.summary}
            </p>
          </div>

          {submission.issues.length > 0 && (
            <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-red-500/50 shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b-4 border-red-500/30 bg-linear-to-r from-red-900/20 to-orange-900/20 flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-2xl font-black text-white font-mono uppercase">
                  ⚠️ Issues Found ({submission.issues.length})
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(groupedIssues)
                    .sort(
                      ([a], [b]) =>
                        severityOrder[a as keyof typeof severityOrder] -
                        severityOrder[b as keyof typeof severityOrder]
                    )
                    .map(([severity, issues]) => (
                      <span
                        key={severity}
                        className={`px-3 py-1 rounded-lg text-xs font-black border-2 font-mono uppercase ${getSeverityBadge(
                          severity
                        )}`}
                      >
                        {severity}: {issues.length}
                      </span>
                    ))}
                </div>
              </div>

              <div className="divide-y-2 divide-purple-500/20">
                {Object.entries(groupedIssues)
                  .sort(
                    ([a], [b]) =>
                      severityOrder[a as keyof typeof severityOrder] -
                      severityOrder[b as keyof typeof severityOrder]
                  )
                  .map(([severity, issues]) => (
                    <div key={severity}>
                      {issues.map((issue) => (
                        <div
                          key={issue.id}
                          className="p-6 hover:bg-purple-500/5 transition"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span
                                  className={`px-3 py-1 rounded-lg text-xs font-black border-2 font-mono uppercase ${getSeverityBadge(
                                    issue.severity
                                  )}`}
                                >
                                  {issue.severity}
                                </span>
                                <span className="text-xs text-gray-400 font-mono font-bold bg-gray-700 px-2 py-1 rounded">
                                  Line {issue.lineStart}
                                  {issue.lineEnd !== issue.lineStart &&
                                    `-${issue.lineEnd}`}
                                </span>
                                {issue.cweId && (
                                  <span className="text-xs text-gray-400 font-mono font-bold bg-gray-700 px-2 py-1 rounded">
                                    {issue.cweId}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-black text-white mb-2 font-mono">
                                {issue.title}
                              </h3>
                              <p className="text-sm text-gray-400 font-mono">
                                {issue.description}
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#1e1e1e] rounded-xl overflow-hidden mb-4 border-2 border-red-500/50">
                            <div className="bg-[#252526] px-4 py-2 border-b-2 border-[#2d2d2d]">
                              <p className="text-xs text-red-400 font-mono font-bold uppercase">
                                ⚠️ Problem Code
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
                            <div className="bg-green-500/20 border-2 border-green-400 rounded-xl p-4 mb-4">
                              <p className="text-sm font-black text-green-300 mb-2 font-mono uppercase">
                                💡 Suggested Fix
                              </p>
                              <p className="text-sm text-green-400 font-mono">
                                {issue.suggestedFix}
                              </p>
                            </div>
                          )}

                          {issue.fixedCode && (
                            <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border-2 border-green-500/50">
                              <div className="bg-[#252526] px-4 py-2 border-b-2 border-[#2d2d2d]">
                                <p className="text-xs text-green-400 font-mono font-bold uppercase">
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

      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 shadow-2xl overflow-hidden">
        <div className="bg-[#1e1e1e] px-4 py-3 flex items-center justify-between border-b-2 border-[#2d2d2d]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span className="text-xs text-gray-400 font-mono font-bold">
            📄 {submission.fileName || `untitled.${submission.language}`}
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
