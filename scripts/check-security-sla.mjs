import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const BOARD = "docs/security/findings/triage-board.v1.json";
const ACTIVE = new Set(["open", "triaged", "in_progress", "ready_for_verify", "reopened"]);
const TERMINAL = new Set(["fixed", "accepted_risk", "deferred"]);
const ALLOWED_SEVERITY = new Set(["critical", "high", "medium", "low"]);

function die(msg) {
  throw new Error(msg);
}

function parseDate(label, value, findingId) {
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) die(`invalid ${label} for finding ${findingId}: ${value}`);
  return ms;
}

const abs = resolve(BOARD);
if (!existsSync(abs)) {
  die(`missing triage board: ${BOARD}`);
}

const board = JSON.parse(readFileSync(abs, "utf8"));
if (board?.schemaVersion !== "elo.security.triage.v1") {
  die(`unexpected triage schemaVersion: ${board?.schemaVersion ?? "<missing>"}`);
}
if (!Array.isArray(board.findings)) {
  die("triage board findings must be an array");
}

const now = Date.now();
const overdue = [];
let activeCount = 0;

for (const finding of board.findings) {
  const id = String(finding?.id ?? "").trim();
  const severity = String(finding?.severity ?? "").toLowerCase();
  const status = String(finding?.status ?? "").toLowerCase();
  if (!id) die("finding.id is required");
  if (!ALLOWED_SEVERITY.has(severity)) die(`invalid severity for finding ${id}: ${severity}`);
  if (!ACTIVE.has(status) && !TERMINAL.has(status)) die(`invalid status for finding ${id}: ${status}`);

  parseDate("openedAt", finding?.openedAt, id);
  const dueMs = parseDate("slaDueAt", finding?.slaDueAt, id);

  if (status === "accepted_risk") {
    const signoff = finding?.acceptedRisk ?? {};
    if (!signoff.approvedBy || !signoff.approvedAt || !signoff.reason) {
      die(`accepted_risk finding missing sign-off fields: ${id}`);
    }
    parseDate("acceptedRisk.approvedAt", signoff.approvedAt, id);
  }

  if (ACTIVE.has(status)) {
    activeCount += 1;
    if (dueMs < now) {
      overdue.push({ id, severity, status, slaDueAt: finding.slaDueAt });
    }
  }
}

if (overdue.length > 0) {
  const lines = overdue.map((f) => `- ${f.id} (${f.severity}/${f.status}) overdue at ${f.slaDueAt}`).join("\n");
  die(`SLA overdue findings detected:\n${lines}`);
}

console.log(`Security SLA check passed. findings=${board.findings.length}, active=${activeCount}, overdue=0`);
