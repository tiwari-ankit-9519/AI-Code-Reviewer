"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSubmissionStatus } from "@/lib/actions/submissions";

export function AnalysisProgress({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "pending" | "analyzing" | "completed" | "failed"
  >("analyzing");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 15;
      });
    }, 500);

    const statusInterval = setInterval(async () => {
      try {
        const result = await getSubmissionStatus(submissionId);
        setStatus(result.status as typeof status);

        if (result.status === "completed") {
          setProgress(100);
          clearInterval(progressInterval);
          clearInterval(statusInterval);
          setTimeout(() => {
            router.refresh();
          }, 1000);
        }

        if (result.status === "failed") {
          clearInterval(progressInterval);
          clearInterval(statusInterval);
        }
      } catch (error) {
        console.error("Status check failed:", error);
      }
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(statusInterval);
    };
  }, [submissionId, router]);

  if (status === "completed") {
    return null;
  }

  if (status === "failed") {
    return (
      <div className="bg-linear-to-br from-red-900/30 to-red-950/30 rounded-2xl border-4 border-red-500 p-6 shadow-2xl shadow-red-500/50">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-red-400 mb-2 font-mono uppercase">
              ❌ Quest Failed
            </h3>
            <p className="text-sm text-red-300 font-mono">
              Analysis encountered an error. Retry your mission!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-6 shadow-2xl overflow-hidden relative">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse"></div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer-effect {
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="flex items-center gap-4 relative z-10">
        <div className="shrink-0">
          <div className="w-16 h-16 bg-linear-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/50 border-4 border-yellow-600 relative">
            <svg
              className="animate-spin h-8 w-8 text-gray-900"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-xl border-4 border-yellow-400 animate-ping opacity-75"></div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-black text-white font-mono uppercase">
              ⚡ Analyzing Code...
            </h3>
            <span className="text-lg font-black text-yellow-400 font-mono bg-yellow-400/20 px-3 py-1 rounded-lg border-2 border-yellow-400/50">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-4 mb-3 border-2 border-purple-500/50 overflow-hidden shadow-inner">
            <div
              className="bg-linear-to-r from-yellow-400 via-orange-500 to-pink-500 h-full rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent shimmer-effect"></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <p className="text-sm text-gray-300 font-mono font-bold">
              {status === "analyzing"
                ? "Running security scans and quality checks..."
                : "Preparing battle analysis..."}
            </p>
          </div>

          {/* Status indicators */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-blue-300 font-mono font-bold">
                🔒 Security
              </p>
            </div>
            <div className="bg-purple-500/20 border border-purple-400/50 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-purple-300 font-mono font-bold">
                ⚡ Performance
              </p>
            </div>
            <div className="bg-green-500/20 border border-green-400/50 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-green-300 font-mono font-bold">
                ✓ Quality
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
