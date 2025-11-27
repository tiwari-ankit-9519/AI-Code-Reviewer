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
      <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#15192c] mb-1">
              Analysis Failed
            </h3>
            <p className="text-sm text-[#6c7681]">
              Something went wrong during analysis. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-[#15192c]">
              Analyzing Code...
            </h3>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-linear-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-[#6c7681]">
            {status === "analyzing"
              ? "Running security and quality checks..."
              : "Preparing analysis..."}
          </p>
        </div>
      </div>
    </div>
  );
}
