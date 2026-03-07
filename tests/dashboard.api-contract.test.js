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

function sortedKeys(obj) {
  return Object.keys(obj).sort();
}

test("dashboard API v1 contract should be stable for frontend integration", async () => {
  const { server } = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    await post(base, "/register-agent", { agentId: "provider-data", ownerId: "ownerP" });
    await post(base, "/register-agent", { agentId: "provider-llm", ownerId: "ownerL" });
    await post(base, "/register-agent", { agentId: "consumer", ownerId: "ownerC" });
    await post(base, "/recharge", { agentId: "consumer", amount: 20 });

    await post(base, "/market/offers/publish", {
      offerId: "offer-dashboard-v1",
      providerAgentId: "provider-data",
      serviceId: "skill/optimizer",
      computeUnits: 120,
      energyKwh: 0.1,
      marketMultiplier: 1,
    });

    await post(base, "/market/purchase", {
      offerId: "offer-dashboard-v1",
      consumerAgentId: "consumer",
      requestId: "dashboard-purchase-1",
    });

    await post(base, "/market/savings-simulate", {
      offerId: "offer-dashboard-v1",
      consumerAgentId: "consumer",
      baseline: {
        providerAgentId: "provider-llm",
        computeUnits: 1000,
        energyKwh: 1,
        marketMultiplier: 1.5,
      },
      optimized: {
        providerAgentId: "provider-llm",
        computeUnits: 600,
        energyKwh: 0.6,
        marketMultiplier: 1.5,
      },
    });

    const schema = await get(base, "/dashboard/schema");
    assert.equal(schema.status, 200);
    assert.equal(schema.body.schemaVersion, "dashboard.v1");
    assert.deepEqual(sortedKeys(schema.body), ["docsPath", "endpoints", "schemaVersion"]);

    const summary = await get(base, "/dashboard/summary");
    assert.equal(summary.status, 200);
    assert.equal(summary.body.schemaVersion, "dashboard.v1");
    assert.deepEqual(sortedKeys(summary.body), ["generatedAt", "kpis", "schemaVersion"]);
    assert.deepEqual(sortedKeys(summary.body.kpis), [
      "agentCount",
      "billableSettlementCount",
      "freeSettlementCount",
      "offerCount",
      "ownerCount",
      "rechargeVolumeElo",
      "settlementVolumeElo",
      "tradeCount",
      "withdrawVolumeElo",
    ]);

    const agents = await get(base, "/dashboard/agents");
    assert.equal(agents.status, 200);
    assert.equal(agents.body.schemaVersion, "dashboard.v1");
    assert.deepEqual(sortedKeys(agents.body), ["generatedAt", "items", "schemaVersion"]);
    assert.ok(agents.body.items.length >= 3);
    assert.deepEqual(sortedKeys(agents.body.items[0]), [
      "agentId",
      "balance",
      "ownerId",
      "rechargeVolumeElo",
      "settlementEarnedCount",
      "settlementEarnedInElo",
      "settlementFreeCount",
      "settlementPaidCount",
      "settlementPaidInElo",
      "withdrawVolumeElo",
    ]);

    const offers = await get(base, "/dashboard/offers");
    assert.equal(offers.status, 200);
    assert.equal(offers.body.schemaVersion, "dashboard.v1");
    assert.equal(offers.body.items.length, 1);
    assert.deepEqual(sortedKeys(offers.body.items[0]), [
      "computeUnits",
      "createdAt",
      "energyKwh",
      "marketMultiplier",
      "metadata",
      "offerId",
      "providerAgentId",
      "providerOwnerId",
      "serviceId",
    ]);

    const trades = await get(base, "/dashboard/trades?limit=1");
    assert.equal(trades.status, 200);
    assert.equal(trades.body.schemaVersion, "dashboard.v1");
    assert.deepEqual(sortedKeys(trades.body), ["aggregates", "generatedAt", "items", "limit", "schemaVersion", "total"]);
    assert.equal(trades.body.limit, 1);
    assert.equal(trades.body.total, 1);
    assert.deepEqual(sortedKeys(trades.body.aggregates), ["billableCount", "freeCount", "volumeElo"]);
    assert.deepEqual(sortedKeys(trades.body.items[0]), [
      "amount",
      "billable",
      "consumerAgentId",
      "consumerOwnerId",
      "offerId",
      "providerAgentId",
      "providerOwnerId",
      "requestId",
      "serviceId",
      "ts",
    ]);

    const savings = await get(base, "/dashboard/savings");
    assert.equal(savings.status, 200);
    assert.equal(savings.body.schemaVersion, "dashboard.v1");
    assert.deepEqual(sortedKeys(savings.body), ["aggregates", "generatedAt", "items", "schemaVersion", "total"]);
    assert.equal(savings.body.total, 1);
    assert.deepEqual(sortedKeys(savings.body.aggregates), ["avgSavingsRate", "maxSavingsRate", "totalSavingsAmount"]);
    assert.deepEqual(sortedKeys(savings.body.items[0]), [
      "baselineAmount",
      "consumerAgentId",
      "offerId",
      "optimizedAmount",
      "providerAgentId",
      "purchaseAmount",
      "savingsAmount",
      "savingsRate",
      "serviceId",
      "totalWithMarket",
      "ts",
    ]);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});
