import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const doc = "docs/security/P4E_EXTERNAL_AUDIT_EXECUTION.zh-en.md";
const requiredMarkers = [
  "### 审计交付物清单",
  "### 严重级别与处理 SLA",
  "### Audit deliverables",
  "### Severity and SLA",
  "### Closeout criteria",
];

const abs = resolve(doc);
if (!existsSync(abs)) {
  throw new Error(`missing required external-audit execution doc: ${doc}`);
}

const content = readFileSync(abs, "utf8");
for (const marker of requiredMarkers) {
  if (!content.includes(marker)) {
    throw new Error(`missing marker "${marker}" in ${doc}`);
  }
}

console.log("P4-E external audit execution artifact check passed.");
