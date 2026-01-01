-- CreateTable
CREATE TABLE "cron_logs" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "duration" INTEGER NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,

    CONSTRAINT "cron_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cron_logs_jobName_idx" ON "cron_logs"("jobName");

-- CreateIndex
CREATE INDEX "cron_logs_executedAt_idx" ON "cron_logs"("executedAt");
