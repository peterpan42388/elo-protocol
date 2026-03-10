import test from "node:test";
import assert from "node:assert/strict";
import { OSCPReviewGuard } from "../src/oscpReviewGuard.js";

test("OSCP review guard should prefer user-owned agent for product requirements", () => {
  const guard = new OSCPReviewGuard();
  const result = guard.evaluateRequirement({
    target: "Build a low-cost workflow for project issue triage",
    replacementTarget: "manual issue sorting",
    constraints: "must follow rules and avoid centralized token cost",
    deliverable: "workflow",
    acceptance: "unit tests and demo",
    risk: "limited scope",
    executionOwner: "user_owned_agent",
  });

  assert.equal(result.decision, "Pass");
  assert.equal(result.recommendedExecutionOwner, "user_owned_agent");
});

test("OSCP review guard should reject prohibited narratives", () => {
  const guard = new OSCPReviewGuard();
  const result = guard.evaluateRequirement({
    target: "Create a no-risk guaranteed returns arbitrage system",
    replacementTarget: "traditional saving products",
    constraints: "none",
    deliverable: "bot",
    acceptance: "profit",
    risk: "none",
    executionOwner: "shared_maintainers",
  });

  assert.equal(result.decision, "Reject");
  assert.ok(result.reasons.some((reason) => reason.includes("guaranteed return narrative")));
});
