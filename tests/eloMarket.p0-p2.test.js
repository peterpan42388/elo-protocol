import test from "node:test";
import assert from "node:assert/strict";
import { SettlementEngine } from "../src/settlementEngine.js";
import { ELOMarket } from "../src/eloMarket.js";

test("P0: virtual market wallets can be funded and settled", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);

  engine.registerAgent("provider", "owner-provider");
  engine.registerAgent("consumer", "owner-consumer");

  engine.recharge("consumer", 5, "virtual_wallet_bootstrap");

  market.publishOffer({
    offerId: "offer-1",
    providerAgentId: "provider",
    serviceId: "api/basic",
    computeUnits: 100,
    energyKwh: 0.05,
    marketMultiplier: 1.1,
  });

  const trade = market.purchase({
    offerId: "offer-1",
    consumerAgentId: "consumer",
    requestId: "p0-req-1",
    usageRef: "p0",
  });

  assert.equal(trade.billable, true);
  assert.ok(trade.amount > 0);
  assert.equal(engine.balanceOf("provider"), trade.amount);
  assert.equal(engine.balanceOf("consumer"), Math.round((5 - trade.amount) * 1_000_000) / 1_000_000);
});

test("P2: market purchase can reduce downstream token cost by >30%", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);

  engine.registerAgent("provider-skill", "owner-skill");
  engine.registerAgent("provider-llm", "owner-llm");
  engine.registerAgent("consumer", "owner-consumer");

  market.publishOffer({
    offerId: "offer-food-optimizer",
    providerAgentId: "provider-skill",
    serviceId: "skill/food-query-optimizer",
    computeUnits: 120,
    energyKwh: 0.1,
    marketMultiplier: 1,
    metadata: { expectedReduction: 0.4 },
  });

  const simulation = market.simulateOptimization({
    offerId: "offer-food-optimizer",
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

  assert.ok(simulation.baselineAmount > 0);
  assert.ok(simulation.totalWithMarket > 0);
  assert.ok(simulation.savingsAmount > 0);
  assert.ok(simulation.savingsRate > 0.3);
});
