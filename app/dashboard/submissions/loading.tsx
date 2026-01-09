import { TableSkeleton } from "@/components/skeleton";
import { DashboardSkeleton } from "@/components/skeleton";

export default function SubmissionsLoading() {
  return (
    <div className="space-y-8">
      {/* Header DashboardSkeleton */}
      <div className="flex items-center justify-between">
        <div>
          <DashboardSkeleton />
          <DashboardSkeleton />
        </div>
        <DashboardSkeleton />
      </div>

      {/* Filter Card DashboardSkeleton */}
      <div className="bg-linear-to-br from-[#1a1f3a] to-[#0a0e27] rounded-2xl border-4 border-purple-500/50 p-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <DashboardSkeleton />
            <DashboardSkeleton />
          </div>
          <div>
            <DashboardSkeleton />
            <DashboardSkeleton />
          </div>
          <div className="flex items-end gap-2">
            <DashboardSkeleton />
            <DashboardSkeleton />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={10} />
    </div>
  );
}
