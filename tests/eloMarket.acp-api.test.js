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

async function get(base, path) {
  const res = await fetch(`${base}${path}`);
  return { status: res.status, body: await res.json() };
}

test("ACP API should support open-accept-fund-execute flow", async () => {
  const { server } = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    await post(base, "/register-agent", { agentId: "provider", ownerId: "ownerP" });
    await post(base, "/register-agent", { agentId: "buyer", ownerId: "ownerB" });
    await post(base, "/recharge", { agentId: "buyer", amount: 20 });

    await post(base, "/market/offers/publish", {
      offerId: "offer-acp-api",
      providerAgentId: "provider",
      serviceId: "skill/acp-service",
      computeUnits: 100,
      energyKwh: 0.1,
      marketMultiplier: 1,
    });

    const open = await post(base, "/market/acp/intents/open", {
      offerId: "offer-acp-api",
      buyerAgentId: "buyer",
      units: 1,
    });
    assert.equal(open.status, 200);
    assert.equal(open.body.schemaVersion, "acp.intent.v1");

    const intentId = open.body.intentId;
    const accept = await post(base, `/market/acp/intents/${intentId}/accept`, {});
    assert.equal(accept.status, 200);
    assert.equal(accept.body.schemaVersion, "acp.acceptance.v1");
    assert.equal(accept.body.escrow.state, "awaiting_fund");

    const escrowId = accept.body.escrow.escrowId;
    const fund = await post(base, `/market/acp/escrow/${escrowId}/fund`, {
      buyerAgentId: "buyer",
    });
    assert.equal(fund.status, 200);
    assert.equal(fund.body.state, "funded");

    const execute = await post(base, `/market/acp/escrow/${escrowId}/execute`, {
      requestId: "acp-api-req-1",
      usageRef: "acp-api",
    });
    assert.equal(execute.status, 200);
    assert.equal(execute.body.schemaVersion, "acp.execution.v1");
    assert.equal(execute.body.trade.billable, true);

    const intentState = await get(base, `/market/acp/intents/${intentId}`);
    assert.equal(intentState.status, 200);
    assert.equal(intentState.body.status, "completed");

    const escrowState = await get(base, `/market/acp/escrow/${escrowId}`);
    assert.equal(escrowState.status, 200);
    assert.equal(escrowState.body.state, "executed");
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});
