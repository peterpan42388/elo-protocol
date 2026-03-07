import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const report = "docs/security/P4C_SECURITY_REVIEW_REPORT.zh-en.md";
const requiredMarkers = [
  "### 主要发现与处置",
  "#### F1（高）",
  "#### F2（中）",
  "#### F3（中）",
  "### Residual risks",
];

const abs = resolve(report);
if (!existsSync(abs)) {
  throw new Error(`missing required security review report: ${report}`);
}

const content = readFileSync(abs, "utf8");
for (const marker of requiredMarkers) {
  if (!content.includes(marker)) {
    throw new Error(`missing marker "${marker}" in ${report}`);
  }
}

console.log("P4-C security review artifact check passed.");
