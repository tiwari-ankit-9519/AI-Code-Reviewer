import { Skeleton } from "@/components/ui/skeleton";

export default function SubmissionDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-12 w-80 mb-3" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/30 p-6 shadow-2xl shadow-purple-500/20"
          >
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="h-10 w-16" />
          </div>
        ))}
      </div>

      {/* Analysis Summary Card */}
      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-6 shadow-2xl">
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>

      {/* Code Display Card */}
      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 shadow-2xl overflow-hidden">
        <div className="bg-linear-to-r from-purple-900/20 to-pink-900/20 px-6 py-4 border-b-4 border-purple-500/30">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="p-6 bg-[#0a0e27]">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full mb-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
