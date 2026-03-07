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

test("x402 API should support challenge-settle-payment-state flow", async () => {
  const { server } = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    await post(base, "/register-agent", { agentId: "provider", ownerId: "ownerP" });
    await post(base, "/register-agent", { agentId: "consumer", ownerId: "ownerC" });
    await post(base, "/recharge", { agentId: "consumer", amount: 20 });

    await post(base, "/market/offers/publish", {
      offerId: "offer-x402-api",
      providerAgentId: "provider",
      serviceId: "workflow/search-optimizer",
      computeUnits: 100,
      energyKwh: 0.1,
      marketMultiplier: 1,
    });

    const challenge = await post(base, "/market/x402/challenge", {
      offerId: "offer-x402-api",
      consumerAgentId: "consumer",
      units: 1,
      usageRef: "x402-api",
    });
    assert.equal(challenge.status, 402);
    assert.equal(challenge.body.schemaVersion, "x402.challenge.v1");
    assert.equal(challenge.body.requiresPayment, true);

    const paymentId = challenge.body.payment.paymentId;

    const statePending = await get(base, `/market/x402/payments/${paymentId}`);
    assert.equal(statePending.status, 200);
    assert.equal(statePending.body.state, "pending");

    const settled = await post(base, "/market/x402/settle", {
      paymentId,
      requestId: "x402-api-req-1",
    });
    assert.equal(settled.status, 200);
    assert.equal(settled.body.schemaVersion, "x402.settlement.v1");
    assert.equal(settled.body.billable, true);

    const stateSettled = await get(base, `/market/x402/payments/${paymentId}`);
    assert.equal(stateSettled.status, 200);
    assert.equal(stateSettled.body.state, "settled");
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});
