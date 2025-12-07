export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-lg ${className}`}
      style={{
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/30 p-6 shadow-2xl shadow-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-12 w-24 mb-2" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/30 shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-linear-to-r from-purple-900/20 to-pink-900/20 border-b-4 border-purple-500/30">
            <tr>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <th key={i} className="px-6 py-4">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-purple-500/20">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="hover:bg-purple-500/10 transition-colors">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <td key={j} className="px-6 py-4">
                    <Skeleton className="h-4 w-28" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-12 w-80 mb-3" />
        <Skeleton className="h-6 w-56" />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Battle Log Skeleton */}
      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/30 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b-4 border-purple-500/30 bg-linear-to-r from-purple-900/20 to-pink-900/20">
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="divide-y-2 divide-purple-500/20">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="px-6 py-5 flex items-center justify-between hover:bg-purple-500/10 transition-colors"
            >
              <div className="flex-1">
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-6 w-6 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-linear-to-br from-cyan-900/30 to-cyan-950/30 rounded-2xl border-4 border-cyan-500/50 shadow-xl p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-pink-900/30 to-pink-950/30 rounded-2xl border-4 border-pink-500/50 shadow-xl p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
