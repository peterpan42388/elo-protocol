import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const requiredFiles = [
  "docs/security/P4F_FINDING_CLOSURE.zh-en.md",
  "docs/security/P4F_FINDINGS_TRIAGE_BOARD.zh-en.md",
  "docs/security/P4F_RELEASE_BLOCK_RULES.zh-en.md",
  "docs/schemas/security.findings-triage.v1.json",
  "docs/security/findings/triage-board.v1.json",
];

const requiredMarkers = [
  ["docs/security/P4F_FINDING_CLOSURE.zh-en.md", "### 已落地能力", "### Delivered capabilities"],
  ["docs/security/P4F_FINDINGS_TRIAGE_BOARD.zh-en.md", "### 状态机", "### State machine"],
  ["docs/security/P4F_RELEASE_BLOCK_RULES.zh-en.md", "### 阻断规则", "### Blocking rules"],
  ["docs/schemas/security.findings-triage.v1.json", "elo.security.triage.v1", "\"severity\""],
  ["docs/security/findings/triage-board.v1.json", "elo.security.triage.v1", "\"findings\""],
];

for (const file of requiredFiles) {
  const abs = resolve(file);
  if (!existsSync(abs)) {
    throw new Error(`missing required P4-F artifact: ${file}`);
  }
}

for (const [file, ...markers] of requiredMarkers) {
  const content = readFileSync(resolve(file), "utf8");
  for (const marker of markers) {
    if (!content.includes(marker)) {
      throw new Error(`missing marker \"${marker}\" in ${file}`);
    }
  }
}

console.log("P4-F closure artifact check passed.");
