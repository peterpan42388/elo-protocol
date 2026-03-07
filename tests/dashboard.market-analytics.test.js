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

test("dashboard market-efficiency and outcomes endpoints should expose analytics extensions", async () => {
  const { server } = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    await post(base, "/register-agent", { agentId: "provider-a", ownerId: "ownerA" });
    await post(base, "/register-agent", { agentId: "provider-b", ownerId: "ownerB" });
    await post(base, "/register-agent", { agentId: "consumer", ownerId: "ownerC" });
    await post(base, "/recharge", { agentId: "consumer", amount: 100 });

    await post(base, "/market/offers/publish", {
      offerId: "offer-analytics-a",
      providerAgentId: "provider-a",
      serviceId: "workflow/optimizer-a",
      computeUnits: 120,
      energyKwh: 0.1,
      marketMultiplier: 1,
      tokenSavingEstimate: 0.35,
    });
    await post(base, "/market/offers/publish", {
      offerId: "offer-analytics-b",
      providerAgentId: "provider-b",
      serviceId: "workflow/optimizer-b",
      computeUnits: 80,
      energyKwh: 0.08,
      marketMultiplier: 1,
      tokenSavingEstimate: 0.25,
    });

    await post(base, "/market/purchase", {
      offerId: "offer-analytics-a",
      consumerAgentId: "consumer",
      requestId: "analytics-req-1",
    });
    await post(base, "/market/purchase", {
      offerId: "offer-analytics-b",
      consumerAgentId: "consumer",
      requestId: "analytics-req-2",
    });

    await post(base, "/market/reviews/submit", {
      listingId: "offer-analytics-a",
      reviewerAgentId: "consumer",
      rating: 5,
      usageReceiptRef: "analytics-req-1",
      tokenSavingObserved: 0.4,
    });
    await post(base, "/market/reviews/submit", {
      listingId: "offer-analytics-b",
      reviewerAgentId: "consumer",
      rating: 4,
      usageReceiptRef: "analytics-req-2",
      tokenSavingObserved: 0.3,
    });

    await post(base, "/market/evaluations/submit", {
      listingId: "offer-analytics-a",
      evaluatorAgentId: "consumer",
      usageReceiptRef: "analytics-req-1",
      baselineAmount: 10,
      actualAmount: 2,
      latencyScore: 5,
      reliabilityScore: 5,
    });
    await post(base, "/market/evaluations/submit", {
      listingId: "offer-analytics-b",
      evaluatorAgentId: "consumer",
      usageReceiptRef: "analytics-req-2",
      baselineAmount: 10,
      actualAmount: 4,
      latencyScore: 4,
      reliabilityScore: 4,
    });

    await post(base, "/market/savings-simulate", {
      offerId: "offer-analytics-a",
      consumerAgentId: "consumer",
      baseline: {
        providerAgentId: "provider-a",
        computeUnits: 1000,
        energyKwh: 1,
        marketMultiplier: 1.5,
      },
      optimized: {
        providerAgentId: "provider-a",
        computeUnits: 600,
        energyKwh: 0.6,
        marketMultiplier: 1.5,
      },
    });
    await post(base, "/market/savings-simulate", {
      offerId: "offer-analytics-b",
      consumerAgentId: "consumer",
      baseline: {
        providerAgentId: "provider-b",
        computeUnits: 800,
        energyKwh: 0.8,
        marketMultiplier: 1.5,
      },
      optimized: {
        providerAgentId: "provider-b",
        computeUnits: 550,
        energyKwh: 0.55,
        marketMultiplier: 1.5,
      },
    });

    const efficiency = await get(base, "/dashboard/market-efficiency?limit=10");
    assert.equal(efficiency.status, 200);
    assert.equal(efficiency.body.schemaVersion, "dashboard.market.v1");
    assert.equal(efficiency.body.total, 2);
    assert.ok(efficiency.body.aggregates.tradeCount >= 2);
    assert.ok(Array.isArray(efficiency.body.items));
    assert.ok(efficiency.body.items[0].efficiencyScore >= efficiency.body.items[1].efficiencyScore);

    const outcomes = await get(base, "/dashboard/outcomes?limit=10");
    assert.equal(outcomes.status, 200);
    assert.equal(outcomes.body.schemaVersion, "dashboard.outcomes.v1");
    assert.equal(outcomes.body.total, 2);
    assert.ok(outcomes.body.aggregates.avgOutcomeScore > 0);
    assert.equal(Array.isArray(outcomes.body.items), true);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});
