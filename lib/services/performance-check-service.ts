// lib/services/performance-check-service.ts

import { Issue, SubscriptionTier } from "@prisma/client";

export type PerformanceCheckLevel = "BASIC" | "ADVANCED" | "ENTERPRISE";

export interface PerformanceCheckConfig {
  level: PerformanceCheckLevel;
  checksEnabled: string[];
  checksDisabled: string[];
  maxIssuesReturned: number;
  includeScalabilityAnalysis: boolean;
  includeLoadTestingRecommendations: boolean;
}

const BASIC_PERFORMANCE_CHECKS = [
  "time_complexity",
  "obvious_memory_leaks",
  "n_plus_1_queries",
  "inefficient_loops",
  "redundant_operations",
];

const ADVANCED_PERFORMANCE_CHECKS = [
  ...BASIC_PERFORMANCE_CHECKS,
  "detailed_complexity_analysis",
  "memory_profiling",
  "database_query_optimization",
  "caching_opportunities",
  "async_await_optimization",
  "resource_cleanup",
  "connection_pooling",
  "lazy_loading",
  "batch_processing",
];

const ENTERPRISE_PERFORMANCE_CHECKS = [
  ...ADVANCED_PERFORMANCE_CHECKS,
  "advanced_profiling",
  "scalability_analysis",
  "load_testing_recommendations",
  "performance_budgets",
  "distributed_system_optimization",
  "microservices_performance",
  "cdn_optimization",
  "concurrent_processing",
  "memory_allocation_patterns",
  "gc_optimization",
];

export function getPerformanceCheckConfig(
  tier: SubscriptionTier
): PerformanceCheckConfig {
  switch (tier) {
    case "STARTER":
      return {
        level: "BASIC",
        checksEnabled: BASIC_PERFORMANCE_CHECKS,
        checksDisabled: ADVANCED_PERFORMANCE_CHECKS.filter(
          (check) => !BASIC_PERFORMANCE_CHECKS.includes(check)
        ).concat(
          ENTERPRISE_PERFORMANCE_CHECKS.filter(
            (check) => !ADVANCED_PERFORMANCE_CHECKS.includes(check)
          )
        ),
        maxIssuesReturned: 10,
        includeScalabilityAnalysis: false,
        includeLoadTestingRecommendations: false,
      };

    case "HERO":
      return {
        level: "ADVANCED",
        checksEnabled: ADVANCED_PERFORMANCE_CHECKS,
        checksDisabled: ENTERPRISE_PERFORMANCE_CHECKS.filter(
          (check) => !ADVANCED_PERFORMANCE_CHECKS.includes(check)
        ),
        maxIssuesReturned: 50,
        includeScalabilityAnalysis: false,
        includeLoadTestingRecommendations: false,
      };

    case "LEGEND":
      return {
        level: "ENTERPRISE",
        checksEnabled: ENTERPRISE_PERFORMANCE_CHECKS,
        checksDisabled: [],
        maxIssuesReturned: -1,
        includeScalabilityAnalysis: true,
        includeLoadTestingRecommendations: true,
      };

    default:
      return {
        level: "BASIC",
        checksEnabled: BASIC_PERFORMANCE_CHECKS,
        checksDisabled: [],
        maxIssuesReturned: 10,
        includeScalabilityAnalysis: false,
        includeLoadTestingRecommendations: false,
      };
  }
}

export function buildPerformanceAnalysisPrompt(
  code: string,
  language: string,
  config: PerformanceCheckConfig
): string {
  const checksDescription = config.checksEnabled
    .map((check) => `- ${check.replace(/_/g, " ")}`)
    .join("\n");

  let basePrompt = `You are an expert performance analyst. Analyze the following ${language} code for performance issues and optimization opportunities.

PERFORMANCE ANALYSIS LEVEL: ${config.level}

Perform the following performance checks:
${checksDescription}

`;

  if (config.level === "BASIC") {
    basePrompt += `Focus on obvious performance bottlenecks and critical issues. Identify algorithmic inefficiencies and memory leaks that would significantly impact performance.

`;
  } else if (config.level === "ADVANCED") {
    basePrompt += `Provide comprehensive performance analysis including:
- Detailed algorithmic complexity analysis
- Memory usage patterns and optimization opportunities
- Database query optimization suggestions
- Caching strategies
- Async/await and concurrency improvements

`;
  } else if (config.level === "ENTERPRISE") {
    basePrompt += `Provide enterprise-grade performance analysis including:
- Advanced profiling insights
- Scalability analysis for high-load scenarios
- Load testing recommendations
- Performance budgets and targets
- Distributed system optimization strategies
- Microservices performance considerations
- CDN and edge caching opportunities

`;
  }

  basePrompt += `CODE:
\`\`\`${language}
${code}
\`\`\`

Provide detailed JSON response with performanceIssues array. Each issue must include:
- type (from the checks list above)
- severity (critical | high | medium | low | info)
- title
- description
- lineStart, lineEnd, column
- codeSnippet
- suggestedFix
- fixedCode
- confidence (0.0-1.0)

${
  config.maxIssuesReturned > 0
    ? `Return maximum ${config.maxIssuesReturned} most impactful issues.`
    : "Return all identified issues."
}

Respond ONLY with valid JSON. No markdown, no explanations outside JSON.`;

  return basePrompt;
}

export function filterPerformanceIssuesByTier(
  issues: Issue[],
  config: PerformanceCheckConfig
): Issue[] {
  let filtered = issues.filter((issue) =>
    config.checksEnabled.some((check) => issue.type.includes(check))
  );

  if (config.maxIssuesReturned > 0) {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    filtered = filtered
      .sort(
        (a, b) =>
          priorityOrder[a.severity as keyof typeof priorityOrder] -
          priorityOrder[b.severity as keyof typeof priorityOrder]
      )
      .slice(0, config.maxIssuesReturned);
  }

  return filtered;
}

export function getPerformanceCheckMetadata(
  tier: SubscriptionTier,
  config: PerformanceCheckConfig
) {
  return {
    tier,
    performanceLevel: config.level,
    checksPerformed: config.checksEnabled,
    checksSkipped: config.checksDisabled,
    analysisDepth: config.level,
  };
}
