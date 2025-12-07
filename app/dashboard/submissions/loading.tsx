import { TableSkeleton } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubmissionsLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-12 w-64 mb-3" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-14 w-40 rounded-xl" />
      </div>

      {/* Filter Card Skeleton */}
      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="flex items-end gap-2">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={10} />
    </div>
  );
}
