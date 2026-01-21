// lib/ai/code-analyzer.ts - COMPLETE TIER-BASED VERSION

import { groq, GROQ_MODELS } from "./groq-client";
import { SubscriptionTier } from "@prisma/client";

export interface AnalysisResult {
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
}

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

// Tier-based analysis configuration
const TIER_ANALYSIS_CONFIG = {
  STARTER: {
    securityChecks: 6,
    performanceChecks: 5,
    maxIssues: 10,
    detailLevel: "basic",
    includeFixSuggestions: false,
  },
  HERO: {
    securityChecks: 13,
    performanceChecks: 13,
    maxIssues: 25,
    detailLevel: "advanced",
    includeFixSuggestions: true,
  },
  LEGEND: {
    securityChecks: 20,
    performanceChecks: 20,
    maxIssues: -1, // unlimited
    detailLevel: "comprehensive",
    includeFixSuggestions: true,
  },
} as const;

function isValidIssue(issue: Issue): issue is Issue {
  return (
    typeof issue === "object" &&
    issue !== null &&
    typeof issue.type === "string" &&
    typeof issue.title === "string" &&
    typeof issue.description === "string" &&
    typeof issue.severity === "string" &&
    typeof issue.lineStart === "number" &&
    typeof issue.lineEnd === "number" &&
    typeof issue.codeSnippet === "string" &&
    typeof issue.confidence === "number"
  );
}

function sanitizeIssues(issues: Issue[], maxIssues: number): Issue[] {
  if (!Array.isArray(issues)) return [];

  const validIssues = issues.filter(isValidIssue).map((issue, index) => ({
    ...issue,
    id: issue.id || `issue-${index + 1}`,
    automatable: Boolean(issue.suggestedFix),
  }));

  // Limit issues based on tier
  if (maxIssues === -1) {
    return validIssues;
  }
  return validIssues.slice(0, maxIssues);
}

function getTierPrompt(
  tier: SubscriptionTier,
  language: string,
  code: string,
): string {
  const config = TIER_ANALYSIS_CONFIG[tier];

  const basePrompt = `You are an expert code reviewer. Analyze the following ${language} code.`;

  const tierSpecificInstructions = {
    STARTER: `
Focus on the most critical issues only. Provide:
- Top ${config.securityChecks} security vulnerabilities
- Top ${config.performanceChecks} performance issues
- Basic code quality assessment
Keep analysis concise and focus on high-impact issues.`,

    HERO: `
Provide comprehensive analysis including:
- Up to ${config.securityChecks} security vulnerabilities with fix suggestions
- Up to ${config.performanceChecks} performance issues with optimizations
- Code smells and maintainability concerns
- Detailed recommendations with code examples`,

    LEGEND: `
Provide enterprise-grade comprehensive analysis including:
- Complete security audit (up to ${config.securityChecks} checks)
- Complete performance analysis (up to ${config.performanceChecks} checks)
- Architectural and design pattern recommendations
- Detailed fix suggestions with before/after code examples
- CWE mappings for security issues
- Confidence scores and automated fix potential`,
  };

  return `${basePrompt}

${tierSpecificInstructions[tier]}

CODE:
\`\`\`${language}
${code}
\`\`\`

Provide a JSON response with this structure. ALL ISSUES MUST BE COMPLETE OBJECTS:
{
  "securityScore": number (0-100),
  "performanceScore": number (0-100),
  "qualityScore": number (0-100),
  "complexityScore": number (0-100),
  "maintainabilityScore": number (0-100),
  "securityIssues": [
    {
      "type": "sql_injection | xss | hardcoded_secret | etc",
      "severity": "critical | high | medium | low | info",
      "title": "Brief title",
      "description": "Detailed explanation",
      "lineStart": number,
      "lineEnd": number,
      "column": number,
      "codeSnippet": "problematic code",
      ${config.includeFixSuggestions ? '"suggestedFix": "how to fix",\n      "fixedCode": "corrected code",' : ""}
      ${tier === "LEGEND" ? '"cweId": "CWE-XXX if applicable",' : ""}
      "confidence": number (0.0-1.0)
    }
  ],
  "performanceIssues": [],
  "codeSmells": [],
  "bugRisks": [],
  "styleSuggestions": [],
  "summary": "Executive summary",
  "recommendations": [
    {
      "priority": number (1-5),
      "category": "security | performance | quality",
      "title": "Recommendation title",
      "impact": "Impact description",
      "effort": "low | medium | high"
    }
  ]
}

CRITICAL: Each issue MUST be a complete object with all required fields. DO NOT return simple strings.
Respond ONLY with valid JSON.`;
}

export async function analyzeCode(
  code: string,
  language: string,
  tier: SubscriptionTier = "STARTER",
): Promise<AnalysisResult> {
  const startTime = Date.now();
  const config = TIER_ANALYSIS_CONFIG[tier];

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert code reviewer. Analyze code at ${config.detailLevel} level. Always respond with valid JSON only. All issues must be complete objects, never simple strings.`,
        },
        {
          role: "user",
          content: getTierPrompt(tier, language, code),
        },
      ],
      model: GROQ_MODELS.LLAMA_70B,
      temperature: 0.2,
      max_tokens: tier === "LEGEND" ? 8192 : tier === "HERO" ? 4096 : 2048,
      response_format: { type: "json_object" },
    });

    const analysisTime = Date.now() - startTime;

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from Groq API");
    }

    const parsed = JSON.parse(content);

    // Sanitize and limit issues based on tier
    const securityIssues = sanitizeIssues(
      parsed.securityIssues || [],
      config.maxIssues === -1
        ? config.securityChecks
        : Math.min(config.maxIssues, config.securityChecks),
    );
    const performanceIssues = sanitizeIssues(
      parsed.performanceIssues || [],
      config.maxIssues === -1
        ? config.performanceChecks
        : Math.min(config.maxIssues, config.performanceChecks),
    );
    const codeSmells = sanitizeIssues(
      parsed.codeSmells || [],
      config.maxIssues === -1 ? 999 : Math.ceil(config.maxIssues / 3),
    );
    const bugRisks = sanitizeIssues(
      parsed.bugRisks || [],
      config.maxIssues === -1 ? 999 : Math.ceil(config.maxIssues / 3),
    );
    const styleSuggestions = sanitizeIssues(
      parsed.styleSuggestions || [],
      config.maxIssues === -1 ? 999 : Math.ceil(config.maxIssues / 3),
    );

    const overallScore = Math.round(
      (parsed.securityScore +
        parsed.performanceScore +
        parsed.qualityScore +
        parsed.complexityScore +
        parsed.maintainabilityScore) /
        5,
    );

    return {
      securityScore: parsed.securityScore || 0,
      performanceScore: parsed.performanceScore || 0,
      qualityScore: parsed.qualityScore || 0,
      complexityScore: parsed.complexityScore || 0,
      maintainabilityScore: parsed.maintainabilityScore || 0,
      overallScore,
      securityIssues,
      performanceIssues,
      codeSmells,
      bugRisks,
      styleSuggestions,
      summary: parsed.summary || "No summary available",
      recommendations: parsed.recommendations || [],
      aiModel: GROQ_MODELS.LLAMA_70B,
      aiProvider: "groq",
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      analysisTime,
    };
  } catch (error) {
    console.error("Groq analysis error:", error);
    throw new Error(
      `Code analysis failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}
