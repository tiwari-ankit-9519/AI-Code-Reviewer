// lib/ai/enhanced-code-analyzer.ts

import { groq, GROQ_MODELS } from "./groq-client";
import { SubscriptionTier } from "@prisma/client";
import {
  getSecurityCheckConfig,
  buildSecurityAnalysisPrompt,
  filterSecurityIssuesByTier,
  getSecurityCheckMetadata,
} from "@/lib/services/security-check-service";
import {
  getPerformanceCheckConfig,
  buildPerformanceAnalysisPrompt,
  filterPerformanceIssuesByTier,
  getPerformanceCheckMetadata,
} from "@/lib/services/performance-check-service";

export interface Issue {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  lineStart: number;
  lineEnd: number;
  column?: number;
  codeSnippet: string;
  suggestedFix?: string;
  fixedCode?: string;
  cweId?: string;
  confidence: number;
  automatable: boolean;
}

export interface Recommendation {
  priority: number;
  category: string;
  title: string;
  impact: string;
  effort: "low" | "medium" | "high";
}

export interface EnhancedAnalysisResult {
  securityScore: number;
  performanceScore: number;
  qualityScore: number;
  complexityScore: number;
  maintainabilityScore: number;
  overallScore: number;
  securityIssues: Issue[];
  performanceIssues: Issue[];
  codeSmells: Issue[];
  bugRisks: Issue[];
  styleSuggestions: Issue[];
  summary: string;
  recommendations: Recommendation[];
  aiModel: string;
  aiProvider: string;
  promptTokens: number;
  completionTokens: number;
  analysisTime: number;
  securityMetadata: ReturnType<typeof getSecurityCheckMetadata>;
  performanceMetadata: ReturnType<typeof getPerformanceCheckMetadata>;
}

export async function analyzeCodeWithTier(
  code: string,
  language: string,
  tier: SubscriptionTier
): Promise<EnhancedAnalysisResult> {
  const startTime = Date.now();

  const securityConfig = getSecurityCheckConfig(tier);
  const performanceConfig = getPerformanceCheckConfig(tier);

  const securityPrompt = buildSecurityAnalysisPrompt(
    code,
    language,
    securityConfig
  );
  const performancePrompt = buildPerformanceAnalysisPrompt(
    code,
    language,
    performanceConfig
  );

  const generalPrompt = `You are an expert code reviewer. Analyze the following ${language} code for code quality, complexity, maintainability, code smells, bug risks, and style issues.

CODE:
\`\`\`${language}
${code}
\`\`\`

Provide a detailed JSON response with:
{
  "qualityScore": number (0-100),
  "complexityScore": number (0-100),
  "maintainabilityScore": number (0-100),
  "codeSmells": [],
  "bugRisks": [],
  "styleSuggestions": [],
  "summary": "Executive summary of findings",
  "recommendations": []
}

Respond ONLY with valid JSON. No markdown, no explanations outside JSON.`;

  try {
    const [securityAnalysis, performanceAnalysis, generalAnalysis] =
      await Promise.all([
        groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are an expert security analyst. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: securityPrompt,
            },
          ],
          model: GROQ_MODELS.LLAMA_70B,
          temperature: 0.2,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }),
        groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are an expert performance analyst. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: performancePrompt,
            },
          ],
          model: GROQ_MODELS.LLAMA_70B,
          temperature: 0.2,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }),
        groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are an expert code quality analyst. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: generalPrompt,
            },
          ],
          model: GROQ_MODELS.LLAMA_70B,
          temperature: 0.2,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }),
      ]);

    const analysisTime = Date.now() - startTime;

    const securityContent = securityAnalysis.choices[0]?.message?.content;
    const performanceContent = performanceAnalysis.choices[0]?.message?.content;
    const generalContent = generalAnalysis.choices[0]?.message?.content;

    if (!securityContent || !performanceContent || !generalContent) {
      throw new Error("No response from Groq API");
    }

    const securityData = JSON.parse(securityContent);
    const performanceData = JSON.parse(performanceContent);
    const generalData = JSON.parse(generalContent);

    let securityIssues = filterSecurityIssuesByTier(
      securityData.securityIssues || [],
      securityConfig
    );
    let performanceIssues = filterPerformanceIssuesByTier(
      performanceData.performanceIssues || [],
      performanceConfig
    );

    securityIssues = securityIssues.map((issue, index) => ({
      ...issue,
      id: `sec-${index + 1}`,
      automatable: !!issue.suggestedFix,
    }));

    performanceIssues = performanceIssues.map((issue, index) => ({
      ...issue,
      id: `perf-${index + 1}`,
      automatable: !!issue.suggestedFix,
    }));

    const codeSmells = (generalData.codeSmells || []).map(
      (issue: Omit<Issue, "id" | "automatable">, index: number) => ({
        ...issue,
        id: `smell-${index + 1}`,
        automatable: !!issue.suggestedFix,
      })
    );
    const bugRisks = (generalData.bugRisks || []).map(
      (issue: Omit<Issue, "id" | "automatable">, index: number) => ({
        ...issue,
        id: `bug-${index + 1}`,
        automatable: !!issue.suggestedFix,
      })
    );
    const styleSuggestions = (generalData.styleSuggestions || []).map(
      (issue: Omit<Issue, "id" | "automatable">, index: number) => ({
        ...issue,
        id: `style-${index + 1}`,
        automatable: !!issue.suggestedFix,
      })
    );

    const securityScore = calculateSecurityScore(securityIssues, tier);
    const performanceScore = calculatePerformanceScore(performanceIssues, tier);
    const qualityScore = generalData.qualityScore || 0;
    const complexityScore = generalData.complexityScore || 0;
    const maintainabilityScore = generalData.maintainabilityScore || 0;

    const overallScore = Math.round(
      (securityScore +
        performanceScore +
        qualityScore +
        complexityScore +
        maintainabilityScore) /
        5
    );

    const totalTokens =
      (securityAnalysis.usage?.prompt_tokens || 0) +
      (performanceAnalysis.usage?.prompt_tokens || 0) +
      (generalAnalysis.usage?.prompt_tokens || 0);

    const totalCompletionTokens =
      (securityAnalysis.usage?.completion_tokens || 0) +
      (performanceAnalysis.usage?.completion_tokens || 0) +
      (generalAnalysis.usage?.completion_tokens || 0);

    return {
      securityScore,
      performanceScore,
      qualityScore,
      complexityScore,
      maintainabilityScore,
      overallScore,
      securityIssues,
      performanceIssues,
      codeSmells,
      bugRisks,
      styleSuggestions,
      summary:
        generalData.summary ||
        `Completed ${securityConfig.level} security analysis and ${performanceConfig.level} performance analysis.`,
      recommendations: generalData.recommendations || [],
      aiModel: GROQ_MODELS.LLAMA_70B,
      aiProvider: "groq",
      promptTokens: totalTokens,
      completionTokens: totalCompletionTokens,
      analysisTime,
      securityMetadata: getSecurityCheckMetadata(tier, securityConfig),
      performanceMetadata: getPerformanceCheckMetadata(tier, performanceConfig),
    };
  } catch (error) {
    console.error("Enhanced analysis error:", error);
    throw new Error(
      `Code analysis failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

function calculateSecurityScore(
  issues: Issue[],
  tier: SubscriptionTier
): number {
  if (issues.length === 0) return 100;

  const weights = {
    critical: 20,
    high: 10,
    medium: 5,
    low: 2,
    info: 1,
  };

  const totalWeight = issues.reduce(
    (sum, issue) => sum + weights[issue.severity],
    0
  );

  const maxPossibleWeight =
    tier === "STARTER" ? 100 : tier === "HERO" ? 200 : 300;

  const score = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100);

  return Math.round(score);
}

function calculatePerformanceScore(
  issues: Issue[],
  tier: SubscriptionTier
): number {
  if (issues.length === 0) return 100;

  const weights = {
    critical: 20,
    high: 10,
    medium: 5,
    low: 2,
    info: 1,
  };

  const totalWeight = issues.reduce(
    (sum, issue) => sum + weights[issue.severity],
    0
  );

  const maxPossibleWeight =
    tier === "STARTER" ? 100 : tier === "HERO" ? 200 : 300;

  const score = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100);

  return Math.round(score);
}
