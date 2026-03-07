import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const BOARD = "docs/security/findings/triage-board.v1.json";
const ACTIVE = new Set(["open", "triaged", "in_progress", "ready_for_verify", "reopened"]);

function die(msg) {
  throw new Error(msg);
}

const abs = resolve(BOARD);
if (!existsSync(abs)) {
  die(`missing triage board: ${BOARD}`);
}

const board = JSON.parse(readFileSync(abs, "utf8"));
if (!Array.isArray(board.findings)) {
  die("triage board findings must be an array");
}

const now = Date.now();
const blockers = [];
for (const finding of board.findings) {
  const id = String(finding?.id ?? "").trim();
  const status = String(finding?.status ?? "").toLowerCase();
  const severity = String(finding?.severity ?? "").toLowerCase();
  const isActive = ACTIVE.has(status);
  const isCriticalOrHigh = severity === "critical" || severity === "high";
  const releaseBlock = finding?.releaseBlock === true;
  const dueAtMs = Date.parse(finding?.slaDueAt ?? "");
  const overdue = isActive && Number.isFinite(dueAtMs) && dueAtMs < now;

  if (isActive && isCriticalOrHigh) {
    blockers.push(`${id}: active ${severity} finding`);
  }
  if (isActive && releaseBlock) {
    blockers.push(`${id}: releaseBlock=true and status=${status}`);
  }
  if (overdue) {
    blockers.push(`${id}: active finding overdue (${finding.slaDueAt})`);
  }

  if (status === "accepted_risk") {
    const signoff = finding?.acceptedRisk ?? {};
    if (!signoff.approvedBy || !signoff.approvedAt || !signoff.reason) {
      blockers.push(`${id}: accepted_risk missing sign-off metadata`);
    }
  }
}

if (blockers.length > 0) {
  const detail = blockers.map((b) => `- ${b}`).join("\n");
  die(`Release blocked by security rules:\n${detail}`);
}

console.log("Release blocker check passed. No blocking security findings.");
