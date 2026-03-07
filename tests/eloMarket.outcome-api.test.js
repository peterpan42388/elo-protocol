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

test("market evaluation APIs should return listing/provider outcome aggregates", async () => {
  const { server } = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    await post(base, "/register-agent", { agentId: "provider", ownerId: "ownerP" });
    await post(base, "/register-agent", { agentId: "consumer", ownerId: "ownerC" });
    await post(base, "/recharge", { agentId: "consumer", amount: 20 });

    await post(base, "/market/offers/publish", {
      offerId: "offer-outcome-api",
      providerAgentId: "provider",
      serviceId: "workflow/optimizer",
      computeUnits: 50,
      energyKwh: 0.05,
      marketMultiplier: 1,
    });

    const buy = await post(base, "/market/purchase", {
      offerId: "offer-outcome-api",
      consumerAgentId: "consumer",
      requestId: "api-outcome-receipt-1",
    });
    assert.equal(buy.status, 200);

    const evalRes = await post(base, "/market/evaluations/submit", {
      listingId: "offer-outcome-api",
      evaluatorAgentId: "consumer",
      usageReceiptRef: "api-outcome-receipt-1",
      baselineAmount: 10,
      actualAmount: 2,
      latencyScore: 4,
      reliabilityScore: 5,
    });
    assert.equal(evalRes.status, 200);
    assert.equal(evalRes.body.schemaVersion, "event.v1");

    const list = await get(base, "/market/evaluations?listingId=offer-outcome-api");
    assert.equal(list.status, 200);
    assert.equal(list.body.evaluations.length, 1);

    const listingOutcome = await get(base, "/market/outcomes/listing/offer-outcome-api");
    assert.equal(listingOutcome.status, 200);
    assert.equal(listingOutcome.body.count, 1);
    assert.ok(listingOutcome.body.avgOutcomeScore > 0);

    const providerOutcome = await get(base, "/market/outcomes/provider/ownerP");
    assert.equal(providerOutcome.status, 200);
    assert.equal(providerOutcome.body.count, 1);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});
