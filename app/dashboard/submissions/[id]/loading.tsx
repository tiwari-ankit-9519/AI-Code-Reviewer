// app/dashboard/submissions/[id]/loading.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubmissionDetailLoading() {
  // Predefined widths for code lines to avoid Math.random() during render
  const codeLineWidths = [
    "75%",
    "90%",
    "85%",
    "70%",
    "95%",
    "80%",
    "65%",
    "88%",
    "92%",
    "78%",
    "83%",
    "72%",
    "87%",
    "94%",
    "76%",
    "89%",
    "81%",
    "68%",
    "91%",
    "84%",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-10 w-3/4 max-w-md" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-2 animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Summary Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issues by Category */}
      <Card className="border-2">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-8 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Display Card */}
      <Card className="border-2 overflow-hidden">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-muted/30 p-6 space-y-2">
            {codeLineWidths.map((width, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4" style={{ width }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      <Card className="border-2">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
