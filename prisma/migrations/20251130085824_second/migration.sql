-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_submissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER NOT NULL,
    "linesOfCode" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "code_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_results" (
    "id" TEXT NOT NULL,
    "securityScore" INTEGER NOT NULL,
    "performanceScore" INTEGER NOT NULL,
    "qualityScore" INTEGER NOT NULL,
    "complexityScore" INTEGER NOT NULL,
    "maintainabilityScore" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "securityIssues" JSONB NOT NULL DEFAULT '[]',
    "performanceIssues" JSONB NOT NULL DEFAULT '[]',
    "codeSmells" JSONB NOT NULL DEFAULT '[]',
    "bugRisks" JSONB NOT NULL DEFAULT '[]',
    "styleSuggestions" JSONB NOT NULL DEFAULT '[]',
    "aiModel" TEXT NOT NULL,
    "aiProvider" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "analysisTime" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionId" TEXT NOT NULL,

    CONSTRAINT "analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lineStart" INTEGER NOT NULL,
    "lineEnd" INTEGER NOT NULL,
    "column" INTEGER,
    "codeSnippet" TEXT NOT NULL,
    "suggestedFix" TEXT,
    "fixedCode" TEXT,
    "cweId" TEXT,
    "cveId" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "automatable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionId" TEXT NOT NULL,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "totalSubmissions" INTEGER NOT NULL,
    "totalIssuesFound" INTEGER NOT NULL,
    "avgSecurityScore" DOUBLE PRECISION NOT NULL,
    "avgPerformanceScore" DOUBLE PRECISION NOT NULL,
    "avgQualityScore" DOUBLE PRECISION NOT NULL,
    "criticalIssues" INTEGER NOT NULL,
    "highIssues" INTEGER NOT NULL,
    "mediumIssues" INTEGER NOT NULL,
    "lowIssues" INTEGER NOT NULL,
    "topSecurityIssues" JSONB NOT NULL,
    "topPerformanceIssues" JSONB NOT NULL,
    "topCodeSmells" JSONB NOT NULL,
    "languageDistribution" JSONB NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_patterns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "badPattern" TEXT NOT NULL,
    "goodPattern" TEXT NOT NULL,
    "regexPattern" TEXT,
    "severity" TEXT NOT NULL,
    "documentation" TEXT,
    "cweReference" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "enableSecurityChecks" BOOLEAN NOT NULL DEFAULT true,
    "enablePerformanceChecks" BOOLEAN NOT NULL DEFAULT true,
    "enableStyleChecks" BOOLEAN NOT NULL DEFAULT true,
    "minimumSeverity" TEXT NOT NULL DEFAULT 'low',
    "emailOnCompletion" BOOLEAN NOT NULL DEFAULT true,
    "emailOnCriticalIssue" BOOLEAN NOT NULL DEFAULT true,
    "defaultAiModel" TEXT NOT NULL DEFAULT 'groq-llama-3.1-70b',
    "maxCodeSize" INTEGER NOT NULL DEFAULT 100000,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "editorTheme" TEXT NOT NULL DEFAULT 'vs-dark',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "limit" INTEGER NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_userId_idx" ON "api_keys"("userId");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "code_submissions_userId_idx" ON "code_submissions"("userId");

-- CreateIndex
CREATE INDEX "code_submissions_createdAt_idx" ON "code_submissions"("createdAt");

-- CreateIndex
CREATE INDEX "code_submissions_status_idx" ON "code_submissions"("status");

-- CreateIndex
CREATE INDEX "code_submissions_language_idx" ON "code_submissions"("language");

-- CreateIndex
CREATE INDEX "code_submissions_userId_createdAt_idx" ON "code_submissions"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "analysis_results_submissionId_key" ON "analysis_results"("submissionId");

-- CreateIndex
CREATE INDEX "analysis_results_overallScore_idx" ON "analysis_results"("overallScore");

-- CreateIndex
CREATE INDEX "analysis_results_createdAt_idx" ON "analysis_results"("createdAt");

-- CreateIndex
CREATE INDEX "issues_submissionId_idx" ON "issues"("submissionId");

-- CreateIndex
CREATE INDEX "issues_type_idx" ON "issues"("type");

-- CreateIndex
CREATE INDEX "issues_severity_idx" ON "issues"("severity");

-- CreateIndex
CREATE INDEX "issues_submissionId_severity_idx" ON "issues"("submissionId", "severity");

-- CreateIndex
CREATE INDEX "analytics_snapshots_userId_idx" ON "analytics_snapshots"("userId");

-- CreateIndex
CREATE INDEX "analytics_snapshots_snapshotDate_idx" ON "analytics_snapshots"("snapshotDate");

-- CreateIndex
CREATE INDEX "code_patterns_language_idx" ON "code_patterns"("language");

-- CreateIndex
CREATE INDEX "code_patterns_category_idx" ON "code_patterns"("category");

-- CreateIndex
CREATE INDEX "code_patterns_isActive_idx" ON "code_patterns"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- CreateIndex
CREATE INDEX "usage_records_userId_idx" ON "usage_records"("userId");

-- CreateIndex
CREATE INDEX "usage_records_timestamp_idx" ON "usage_records"("timestamp");

-- CreateIndex
CREATE INDEX "usage_records_resourceType_idx" ON "usage_records"("resourceType");

-- CreateIndex
CREATE INDEX "rate_limit_buckets_userId_idx" ON "rate_limit_buckets"("userId");

-- CreateIndex
CREATE INDEX "rate_limit_buckets_windowEnd_idx" ON "rate_limit_buckets"("windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limit_buckets_userId_resource_windowStart_key" ON "rate_limit_buckets"("userId", "resource", "windowStart");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "code_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "code_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_limit_buckets" ADD CONSTRAINT "rate_limit_buckets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
