import test from "node:test";
import assert from "node:assert/strict";
import { SettlementEngine } from "../src/settlementEngine.js";
import { ELOMarket } from "../src/eloMarket.js";

test("evaluateTrade should require valid usage receipt and consumer-bound evaluator", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);

  engine.registerAgent("provider", "ownerP");
  engine.registerAgent("consumer", "ownerC");
  engine.registerAgent("observer", "ownerO");
  engine.recharge("consumer", 100, "test");

  market.publishOffer({
    offerId: "offer-outcome-1",
    providerAgentId: "provider",
    serviceId: "workflow/price-optimizer",
    computeUnits: 30,
    energyKwh: 0.02,
    marketMultiplier: 1,
    priceElo: 1,
  });

  market.purchase({
    offerId: "offer-outcome-1",
    consumerAgentId: "consumer",
    requestId: "req-outcome-1",
  });

  assert.throws(
    () =>
      market.evaluateTrade({
        listingId: "offer-outcome-1",
        evaluatorAgentId: "observer",
        usageReceiptRef: "req-outcome-1",
        baselineAmount: 5,
      }),
    /evaluatorAgentId must match usage consumer/
  );

  const evaluation = market.evaluateTrade({
    listingId: "offer-outcome-1",
    evaluatorAgentId: "consumer",
    usageReceiptRef: "req-outcome-1",
    baselineAmount: 5,
    actualAmount: 1,
    latencyScore: 5,
    reliabilityScore: 5,
  });

  assert.equal(evaluation.schemaVersion, "event.v1");
  assert.ok(evaluation.outcomeScore > 0);
  assert.ok(evaluation.outcomeBonus > 0);

  const summary = market.getListingOutcome("offer-outcome-1");
  assert.equal(summary.count, 1);
  assert.ok(summary.avgOutcomeScore > 0);

  assert.throws(
    () =>
      market.evaluateTrade({
        listingId: "offer-outcome-1",
        evaluatorAgentId: "consumer",
        usageReceiptRef: "req-outcome-1",
        baselineAmount: 5,
      }),
    /duplicate evaluation/
  );
});

test("searchListings should support outcome sort mode", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);

  engine.registerAgent("provider-good", "ownerP1");
  engine.registerAgent("provider-bad", "ownerP2");
  engine.registerAgent("consumer", "ownerC");
  engine.recharge("consumer", 100, "test");

  market.publishOffer({
    offerId: "offer-good",
    providerAgentId: "provider-good",
    serviceId: "workflow/food-price-optimizer",
    computeUnits: 30,
    energyKwh: 0.02,
    marketMultiplier: 1,
    priceElo: 1,
    title: "Food price optimizer",
    summary: "High quality workflow for food price optimization",
    tags: ["food", "workflow", "optimizer"],
  });

  market.publishOffer({
    offerId: "offer-bad",
    providerAgentId: "provider-bad",
    serviceId: "workflow/food-price-basic",
    computeUnits: 30,
    energyKwh: 0.02,
    marketMultiplier: 1,
    priceElo: 1,
    title: "Food price basic",
    summary: "Basic workflow for food price checks",
    tags: ["food", "workflow"],
  });

  market.purchase({ offerId: "offer-good", consumerAgentId: "consumer", requestId: "req-good" });
  market.purchase({ offerId: "offer-bad", consumerAgentId: "consumer", requestId: "req-bad" });

  market.evaluateTrade({
    listingId: "offer-good",
    evaluatorAgentId: "consumer",
    usageReceiptRef: "req-good",
    baselineAmount: 10,
    actualAmount: 1,
    latencyScore: 5,
    reliabilityScore: 5,
  });

  market.evaluateTrade({
    listingId: "offer-bad",
    evaluatorAgentId: "consumer",
    usageReceiptRef: "req-bad",
    baselineAmount: 10,
    actualAmount: 9,
    latencyScore: 1,
    reliabilityScore: 1,
  });

  const ranked = market.searchListings({
    query: "food workflow optimizer",
    sort: { mode: "outcome", direction: "desc" },
    page: { offset: 0, limit: 5 },
  });

  assert.equal(ranked.items[0].offer.offerId, "offer-good");
  assert.ok(ranked.items[0].score.outcomeScore > ranked.items[1].score.outcomeScore);
});
