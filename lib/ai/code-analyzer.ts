import { groq, GROQ_MODELS } from "./groq-client";

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

export async function analyzeCode(
  code: string,
  language: string
): Promise<AnalysisResult> {
  const startTime = Date.now();

  const prompt = `You are an expert code reviewer. Analyze the following ${language} code for security vulnerabilities, performance issues, code quality, complexity, and maintainability.

CODE:
\`\`\`${language}
${code}
\`\`\`

Provide a detailed JSON response with the following structure:
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
      "suggestedFix": "how to fix",
      "fixedCode": "corrected code",
      "cweId": "CWE-XXX if applicable",
      "confidence": number (0.0-1.0)
    }
  ],
  "performanceIssues": [],
  "codeSmells": [],
  "bugRisks": [],
  "styleSuggestions": [],
  "summary": "Executive summary of findings",
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

Respond ONLY with valid JSON. No markdown, no explanations outside JSON.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert code reviewer specializing in security, performance, and code quality analysis. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: GROQ_MODELS.LLAMA_70B,
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const analysisTime = Date.now() - startTime;

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from Groq API");
    }

    const parsed = JSON.parse(content);

    const issues = [
      ...(parsed.securityIssues || []),
      ...(parsed.performanceIssues || []),
      ...(parsed.codeSmells || []),
      ...(parsed.bugRisks || []),
      ...(parsed.styleSuggestions || []),
    ];

    issues.forEach((issue, index) => {
      issue.id = `issue-${index + 1}`;
      issue.automatable = issue.suggestedFix ? true : false;
    });

    const overallScore = Math.round(
      (parsed.securityScore +
        parsed.performanceScore +
        parsed.qualityScore +
        parsed.complexityScore +
        parsed.maintainabilityScore) /
        5
    );

    return {
      securityScore: parsed.securityScore || 0,
      performanceScore: parsed.performanceScore || 0,
      qualityScore: parsed.qualityScore || 0,
      complexityScore: parsed.complexityScore || 0,
      maintainabilityScore: parsed.maintainabilityScore || 0,
      overallScore,
      securityIssues: parsed.securityIssues || [],
      performanceIssues: parsed.performanceIssues || [],
      codeSmells: parsed.codeSmells || [],
      bugRisks: parsed.bugRisks || [],
      styleSuggestions: parsed.styleSuggestions || [],
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
      }`
    );
  }
}
