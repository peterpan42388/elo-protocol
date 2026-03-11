import test from "node:test";
import assert from "node:assert/strict";
import { createApiServer } from "../src/apiServer.js";

async function post(base, path, body) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

test("OSCP API should register identities, evaluate requirements, and create projects", async () => {
  const { server } = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  const human = await post(base, "/oscp/humans/register", {
    humanId: "human.oscp.leo",
    metadata: { displayName: "Leo", githubLogin: "metavie-leo" },
  });
  assert.equal(human.status, 200);

  const agent = await post(base, "/oscp/agents/register", {
    agentId: "agent.oscp.leo.builder",
    humanId: "human.oscp.leo",
    metadata: { label: "Builder" },
  });
  assert.equal(agent.status, 200);
  assert.match(agent.body.initProfile.initId, /^init:agent:/);
  assert.ok(agent.body.balance > 0);

  const init = await post(base, "/oscp/init-ids/assign", {
    subjectType: "agent",
    subjectId: "agent.oscp.leo.builder",
  });
  assert.equal(init.status, 200);
  assert.match(init.body.initId, /^init:/);

  const review = await post(base, "/oscp/review-guard/requirements/evaluate", {
    target: "Create protocol review automation",
    replacementTarget: "manual review repetition",
    constraints: "must follow Rules and avoid centralized token cost",
    deliverable: "review guard",
    acceptance: "tests and policy checks",
    risk: "false positives",
    executionOwner: "shared_maintainers",
  });
  assert.equal(review.status, 200);
  assert.equal(review.body.decision, "Pass");

  const project = await post(base, "/oscp/projects/create", {
    projectId: "project.oscp.review-guard",
    proposerHumanId: "human.oscp.leo",
    title: "OSCP Review Guard",
    summary: "Automate repository rule checks",
    replacementTarget: "manual repetitive review",
    executionOwner: "shared_maintainers",
  });
  assert.equal(project.status, 200);

  const contribution = await post(base, "/oscp/projects/contributions/record", {
    contributionId: "contribution.oscp.review-guard.1",
    projectId: "project.oscp.review-guard",
    contributorInitId: agent.body.initProfile.initId,
    contributorAgentId: "agent.oscp.leo.builder",
    kind: "implementation",
    demandRating: 5,
    usageCount: 10,
    accepted: true,
  });
  assert.equal(contribution.status, 200);
  assert.ok(contribution.body.score > 0);

  const credit = await post(base, "/oscp/projects/accounts/credit", {
    projectId: "project.oscp.review-guard",
    amount: 50,
    source: "usage",
  });
  assert.equal(credit.status, 200);
  assert.equal(credit.body.balanceElo, 50);

  const distribution = await post(base, "/oscp/projects/revenue/distribute", {
    projectId: "project.oscp.review-guard",
  });
  assert.equal(distribution.status, 200);
  assert.equal(distribution.body.distributableElo, 50);
  assert.equal(distribution.body.allocations.length, 1);

  const summaryResp = await fetch(`${base}/oscp/identities/summary`);
  const summary = await summaryResp.json();
  assert.equal(summary.totals.humans, 1);
  assert.equal(summary.totals.agents, 1);
  assert.ok(summary.totals.initProfiles >= 1);

  const projectsSummaryResp = await fetch(`${base}/oscp/projects/summary`);
  const projectsSummary = await projectsSummaryResp.json();
  assert.equal(projectsSummary.totals.projects, 1);

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});
