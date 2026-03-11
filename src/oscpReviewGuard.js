import { assertBoundedText } from "./inputGuards.js";

const REJECT_PATTERNS = [
  { pattern: /\bguaranteed\s+returns?\b/i, reason: "诱导性金融叙事 / guaranteed return narrative" },
  { pattern: /\bno[-\s]?risk\b/i, reason: "无风险承诺 / no-risk promise" },
  { pattern: /\bmoney\s+launder/i, reason: "洗钱用途 / money laundering use case" },
  { pattern: /\bsanction\s+evasion\b/i, reason: "制裁规避 / sanctions evasion" },
  { pattern: /\bbypass\s+kyc\b/i, reason: "规避 KYC / bypassing KYC" },
];

const SHARED_INFRA_KEYWORDS = [
  "protocol",
  "rule",
  "review",
  "template",
  "schema",
  "governance",
  "identity",
  "project commons",
  "market infra",
  "dashboard",
  "api",
];

export class OSCPReviewGuard {
  evaluateRequirement(input = {}) {
    const normalized = {
      target: assertBoundedText("target", String(input.target ?? ""), 2000),
      replacementTarget: assertBoundedText("replacementTarget", String(input.replacementTarget ?? ""), 1000),
      constraints: assertBoundedText("constraints", String(input.constraints ?? ""), 2000),
      deliverable: assertBoundedText("deliverable", String(input.deliverable ?? ""), 1000),
      acceptance: assertBoundedText("acceptance", String(input.acceptance ?? ""), 2000),
      risk: assertBoundedText("risk", String(input.risk ?? ""), 2000),
      executionOwner: assertBoundedText("executionOwner", String(input.executionOwner ?? ""), 128),
    };

    const reasons = [];
    for (const [key, value] of Object.entries(normalized)) {
      if (key === "executionOwner") continue;
      if (!value) reasons.push(`missing required field: ${key}`);
    }

    const aggregate = Object.values(normalized).join("\n");
    for (const entry of REJECT_PATTERNS) {
      if (entry.pattern.test(aggregate)) {
        reasons.push(`rejected by policy: ${entry.reason}`);
      }
    }

    const recommendedExecutionOwner = this.#recommendExecutionOwner(normalized);
    const requestedExecutionOwner = normalized.executionOwner || "user_owned_agent";

    let decision = "Pass";
    if (reasons.length > 0) {
      decision = "Reject";
    } else if (requestedExecutionOwner !== recommendedExecutionOwner) {
      decision = "Revise";
      reasons.push(`recommended executionOwner is ${recommendedExecutionOwner}, got ${requestedExecutionOwner}`);
    }

    return {
      schemaVersion: "oscp.review-guard.requirement.v1",
      decision,
      requestedExecutionOwner,
      recommendedExecutionOwner,
      reasons,
      confirmedDirection: decision !== "Reject",
    };
  }

  #recommendExecutionOwner(normalized) {
    const haystack = `${normalized.target}\n${normalized.deliverable}\n${normalized.replacementTarget}`.toLowerCase();
    if (SHARED_INFRA_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
      return "shared_maintainers";
    }
    return "user_owned_agent";
  }
}
