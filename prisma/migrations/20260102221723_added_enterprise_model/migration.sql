-- CreateTable
CREATE TABLE "enterprise_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "teamSize" TEXT,
    "useCase" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "enterprise_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enterprise_leads_status_idx" ON "enterprise_leads"("status");

-- CreateIndex
CREATE INDEX "enterprise_leads_createdAt_idx" ON "enterprise_leads"("createdAt");

-- CreateIndex
CREATE INDEX "enterprise_leads_email_idx" ON "enterprise_leads"("email");
