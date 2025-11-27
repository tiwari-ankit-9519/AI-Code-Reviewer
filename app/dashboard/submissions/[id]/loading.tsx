import { Skeleton } from "@/components/ui/skeleton";

export default function SubmissionDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-[#ececec] p-4"
          >
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#ececec] p-6 shadow-sm">
        <Skeleton className="h-6 w-32 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="bg-white rounded-lg border border-[#ececec] shadow-sm overflow-hidden">
        <div className="bg-[#1e1e1e] px-4 py-3">
          <Skeleton className="h-4 w-32 bg-gray-700" />
        </div>
        <div className="p-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full mb-2 bg-gray-700" />
          ))}
        </div>
      </div>
    </div>
  );
}
