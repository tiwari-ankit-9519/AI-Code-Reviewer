import { getCronJobsStatus } from "@/lib/actions/admin-cron";
import JobStatusCard from "@/components/admin/JobStatusCard";
import ManualTriggerPanel from "@/components/admin/ManualTriggerPanel";
import { Settings } from "lucide-react";

export default async function AdminJobsPage() {
  const jobsStatus = await getCronJobsStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Cron Jobs Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage automated background tasks
        </p>
      </div>

      {/* Job Status Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {jobsStatus.map((job) => (
          <JobStatusCard key={job.jobName} job={job} />
        ))}
      </div>

      {/* Manual Trigger Panel */}
      <ManualTriggerPanel />
    </div>
  );
}
