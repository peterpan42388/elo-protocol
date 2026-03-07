import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const requiredFiles = [
  "docs/security/P4B_AUDIT_PREP.zh-en.md",
  "docs/security/THREAT_MODEL.zh-en.md",
  "docs/security/RISK_MATRIX.zh-en.md",
  "docs/security/SECURITY_REVIEW_CHECKLIST.zh-en.md",
  "docs/security/REGRESSION_STRATEGY.zh-en.md",
];

const requiredMarkers = [
  ["docs/security/THREAT_MODEL.zh-en.md", "### 残余风险", "### Residual risks"],
  ["docs/security/RISK_MATRIX.zh-en.md", "R8", "High-priority"],
  ["docs/security/SECURITY_REVIEW_CHECKLIST.zh-en.md", "### A. 协议与不变量", "### A. Protocol and invariants"],
  ["docs/security/REGRESSION_STRATEGY.zh-en.md", "verify:p4b-audit-prep", "Minimum gates"],
];

for (const file of requiredFiles) {
  const abs = resolve(file);
  if (!existsSync(abs)) {
    throw new Error(`missing required audit-prep artifact: ${file}`);
  }
}

for (const [file, ...markers] of requiredMarkers) {
  const abs = resolve(file);
  const content = readFileSync(abs, "utf8");
  for (const marker of markers) {
    if (!content.includes(marker)) {
      throw new Error(`missing marker "${marker}" in ${file}`);
    }
  }
}

console.log("P4-B audit prep artifact check passed.");
