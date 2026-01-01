"use client";

import { formatDistanceToNow } from "date-fns";
import { Prisma } from "@prisma/client";

interface JobExecution {
  executedAt: Date;
  status: string;
  duration: number;
  results: Prisma.JsonValue;
}

interface JobStats {
  totalRuns: number;
  successfulRuns: number;
  successRate: number;
}

interface JobStatus {
  jobName: string;
  lastExecution: {
    executedAt: Date;
    status: string;
    duration: number;
    results: Prisma.JsonValue;
    error: string | null;
  } | null;
  recentExecutions: JobExecution[];
  stats: JobStats;
}

export default function JobStatusCard({ job }: { job: JobStatus }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-400";
      case "PARTIAL":
        return "text-yellow-400";
      case "FAILED":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500/20 border-green-500";
      case "PARTIAL":
        return "bg-yellow-500/20 border-yellow-500";
      case "FAILED":
        return "bg-red-500/20 border-red-500";
      default:
        return "bg-gray-500/20 border-gray-500";
    }
  };

  const formatJobName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-black text-white">
          {formatJobName(job.jobName)}
        </h3>
        {job.lastExecution && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBg(
              job.lastExecution.status
            )}`}
          >
            {job.lastExecution.status}
          </span>
        )}
      </div>

      {job.lastExecution ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Last Run:</span>
            <span className="text-white font-mono text-sm">
              {formatDistanceToNow(new Date(job.lastExecution.executedAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Duration:</span>
            <span className="text-white font-mono text-sm">
              {job.lastExecution.duration}ms
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Success Rate:</span>
            <span
              className={`font-bold ${
                job.stats.successRate >= 90
                  ? "text-green-400"
                  : job.stats.successRate >= 70
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {job.stats.successRate.toFixed(1)}%
            </span>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-3 mt-3">
            <p className="text-xs text-gray-500 mb-1">Last Result:</p>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(job.lastExecution.results, null, 2)}
            </pre>
          </div>

          {job.lastExecution.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-3">
              <p className="text-xs text-red-400 font-mono">
                {job.lastExecution.error}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No executions yet</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Runs:</span>
          <span className="text-white font-bold">{job.stats.totalRuns}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-400">Successful:</span>
          <span className="text-green-400 font-bold">
            {job.stats.successfulRuns}
          </span>
        </div>
      </div>

      <details className="mt-4">
        <summary className="text-sm text-purple-400 cursor-pointer hover:text-purple-300">
          Recent Executions ({job.recentExecutions.length})
        </summary>
        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
          {job.recentExecutions.map((exec, idx) => (
            <div
              key={idx}
              className="bg-gray-900/30 rounded p-2 flex justify-between items-center"
            >
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(exec.executedAt), {
                  addSuffix: true,
                })}
              </span>
              <span
                className={`text-xs font-bold ${getStatusColor(exec.status)}`}
              >
                {exec.status}
              </span>
              <span className="text-xs text-gray-500">{exec.duration}ms</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
