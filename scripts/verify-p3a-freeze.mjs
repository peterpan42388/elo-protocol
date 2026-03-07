import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const requiredFiles = [
  "docs/architecture/P3A_ARCHITECTURE_FREEZE.zh-en.md",
  "docs/architecture/adr/ADR-001-protocol-market-boundary.md",
  "docs/architecture/adr/ADR-002-event-driven-transaction-flow.md",
  "docs/architecture/adr/ADR-003-contract-versioning-policy.md",
  "docs/architecture/adr/ADR-004-free-listing-review-gating.md",
  "docs/architecture/adr/ADR-005-ranking-governance-minimum.md",
  "docs/schemas/listing.v1.json",
  "docs/schemas/review.v1.json",
  "docs/schemas/event.v1.json",
  "docs/schemas/query.dsl.v1.json"
];

const jsonChecks = [
  ["docs/schemas/listing.v1.json", "listing.v1"],
  ["docs/schemas/review.v1.json", "review.v1"],
  ["docs/schemas/event.v1.json", "event.v1"],
  ["docs/schemas/query.dsl.v1.json", "query.dsl.v1"]
];

for (const f of requiredFiles) {
  const abs = resolve(f);
  if (!existsSync(abs)) {
    throw new Error(`missing required freeze artifact: ${f}`);
  }
}

for (const [f, expectedVersion] of jsonChecks) {
  const abs = resolve(f);
  const json = JSON.parse(readFileSync(abs, "utf8"));
  const actualVersion = json?.properties?.schemaVersion?.const;
  if (actualVersion !== expectedVersion) {
    throw new Error(`${f} schemaVersion.const mismatch: expected ${expectedVersion}, got ${actualVersion}`);
  }
}

console.log("P3-A freeze artifact check passed.");
