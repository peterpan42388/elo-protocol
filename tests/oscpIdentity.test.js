import test from "node:test";
import assert from "node:assert/strict";
import { OSCPIdentityRegistry } from "../src/oscpIdentity.js";

test("OSCP identity registry should register humans, agents, and deterministic init profiles", () => {
  const identity = new OSCPIdentityRegistry();

  const human = identity.registerHuman("human.alice", { displayName: "Alice" });
  assert.equal(human.humanId, "human.alice");

  const agent = identity.registerAgent("agent.alice.builder", "human.alice", { label: "Builder" });
  assert.equal(agent.humanId, "human.alice");

  const initA = identity.assignInitId({ subjectType: "human", subjectId: "human.alice" });
  const initB = identity.assignInitId({ subjectType: "human", subjectId: "human.alice" });

  assert.equal(initA.initId, initB.initId);
  assert.match(initA.faction, /civilian|middle|elite/);
  assert.ok(initA.initialElo >= 0);

  const summary = identity.buildSummary();
  assert.equal(summary.totals.humans, 1);
  assert.equal(summary.totals.agents, 1);
  assert.equal(summary.totals.initProfiles, 1);
});

test("OSCP identity metrics should update without going negative", () => {
  const identity = new OSCPIdentityRegistry();
  identity.registerHuman("human.bob");
  const init = identity.assignInitId({ subjectType: "human", subjectId: "human.bob" });

  const updated = identity.recordMetrics(init.initId, {
    contributionScore: 5,
    reputation: 2,
    creditScore: -3,
    projectCreatedCount: 1,
  });

  assert.equal(updated.metrics.contributionScore, 5);
  assert.equal(updated.metrics.reputation, 2);
  assert.equal(updated.metrics.creditScore, 0);
  assert.equal(updated.metrics.projectCreatedCount, 1);
});
