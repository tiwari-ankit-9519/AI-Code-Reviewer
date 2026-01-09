-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "submissionUpdates" BOOLEAN NOT NULL DEFAULT true;
