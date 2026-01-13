// lib/services/security-check-service.ts

import { Issue, SubscriptionTier } from "@prisma/client";

export type SecurityCheckLevel = "BASIC" | "ADVANCED" | "ENTERPRISE";

export interface SecurityCheckConfig {
  level: SecurityCheckLevel;
  checksEnabled: string[];
  checksDisabled: string[];
  maxIssuesReturned: number;
  includeCompliance: boolean;
  includeZeroDayPatterns: boolean;
}

const BASIC_SECURITY_CHECKS = [
  "sql_injection",
  "xss",
  "hardcoded_secrets",
  "basic_authentication",
  "path_traversal",
  "command_injection",
];

const ADVANCED_SECURITY_CHECKS = [
  ...BASIC_SECURITY_CHECKS,
  "csrf",
  "session_management",
  "input_validation",
  "output_encoding",
  "rate_limiting",
  "authentication_bypass",
  "authorization_flaws",
  "insecure_deserialization",
  "xml_external_entities",
  "security_misconfiguration",
];

const ENTERPRISE_SECURITY_CHECKS = [
  ...ADVANCED_SECURITY_CHECKS,
  "zero_day_patterns",
  "compliance_owasp_top10",
  "compliance_pci_dss",
  "compliance_gdpr",
  "advanced_cryptography",
  "supply_chain_security",
  "api_security",
  "cloud_security",
  "container_security",
  "secret_scanning_advanced",
];

export function getSecurityCheckConfig(
  tier: SubscriptionTier
): SecurityCheckConfig {
  switch (tier) {
    case "STARTER":
      return {
        level: "BASIC",
        checksEnabled: BASIC_SECURITY_CHECKS,
        checksDisabled: ADVANCED_SECURITY_CHECKS.filter(
          (check) => !BASIC_SECURITY_CHECKS.includes(check)
        ).concat(
          ENTERPRISE_SECURITY_CHECKS.filter(
            (check) => !ADVANCED_SECURITY_CHECKS.includes(check)
          )
        ),
        maxIssuesReturned: 10,
        includeCompliance: false,
        includeZeroDayPatterns: false,
      };

    case "HERO":
      return {
        level: "ADVANCED",
        checksEnabled: ADVANCED_SECURITY_CHECKS,
        checksDisabled: ENTERPRISE_SECURITY_CHECKS.filter(
          (check) => !ADVANCED_SECURITY_CHECKS.includes(check)
        ),
        maxIssuesReturned: 50,
        includeCompliance: false,
        includeZeroDayPatterns: false,
      };

    case "LEGEND":
      return {
        level: "ENTERPRISE",
        checksEnabled: ENTERPRISE_SECURITY_CHECKS,
        checksDisabled: [],
        maxIssuesReturned: -1,
        includeCompliance: true,
        includeZeroDayPatterns: true,
      };

    default:
      return {
        level: "BASIC",
        checksEnabled: BASIC_SECURITY_CHECKS,
        checksDisabled: [],
        maxIssuesReturned: 10,
        includeCompliance: false,
        includeZeroDayPatterns: false,
      };
  }
}

export function buildSecurityAnalysisPrompt(
  code: string,
  language: string,
  config: SecurityCheckConfig
): string {
  const checksDescription = config.checksEnabled
    .map((check) => `- ${check.replace(/_/g, " ")}`)
    .join("\n");

  let basePrompt = `You are an expert security analyst. Analyze the following ${language} code for security vulnerabilities.

SECURITY ANALYSIS LEVEL: ${config.level}

Perform the following security checks:
${checksDescription}

`;

  if (config.level === "BASIC") {
    basePrompt += `Focus on critical and high severity issues only. Limit your analysis to the most common and dangerous vulnerabilities.

`;
  } else if (config.level === "ADVANCED") {
    basePrompt += `Provide comprehensive security analysis including medium severity issues. Include context about attack vectors and exploitation scenarios.

`;
  } else if (config.level === "ENTERPRISE") {
    basePrompt += `Provide deep security analysis including all severity levels. Include compliance checks, zero-day pattern detection, and advanced cryptographic analysis.

COMPLIANCE FRAMEWORKS TO CHECK:
- OWASP Top 10
- PCI DSS
- GDPR requirements

`;
  }

  basePrompt += `CODE:
\`\`\`${language}
${code}
\`\`\`

Provide detailed JSON response with securityIssues array. Each issue must include:
- type (from the checks list above)
- severity (critical | high | medium | low | info)
- title
- description
- lineStart, lineEnd, column
- codeSnippet
- suggestedFix
- fixedCode
- cweId (if applicable)
- confidence (0.0-1.0)

${
  config.maxIssuesReturned > 0
    ? `Return maximum ${config.maxIssuesReturned} most critical issues.`
    : "Return all identified issues."
}

Respond ONLY with valid JSON. No markdown, no explanations outside JSON.`;

  return basePrompt;
}

export function filterSecurityIssuesByTier(
  issues: Issue[],
  config: SecurityCheckConfig
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

export function getSecurityCheckMetadata(
  tier: SubscriptionTier,
  config: SecurityCheckConfig
) {
  return {
    tier,
    securityLevel: config.level,
    checksPerformed: config.checksEnabled,
    checksSkipped: config.checksDisabled,
    analysisDepth: config.level,
  };
}
