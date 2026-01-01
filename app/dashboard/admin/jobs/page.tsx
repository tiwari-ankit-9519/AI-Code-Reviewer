import { getCronJobsStatus } from "@/lib/actions/admin-cron";
import JobStatusCard from "@/components/admin/JobStatusCard";
import ManualTriggerPanel from "@/components/admin/ManualTriggerPanel";

export default async function AdminJobsPage() {
  const jobsStatus = await getCronJobsStatus();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 mb-2">
          ⚙️ CRON JOBS DASHBOARD
        </h1>
        <p className="text-gray-400">
          Monitor and manage automated background tasks
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {jobsStatus.map((job) => (
          <JobStatusCard key={job.jobName} job={job} />
        ))}
      </div>

      <ManualTriggerPanel />
    </>
  );
}
