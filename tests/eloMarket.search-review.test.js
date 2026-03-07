import test from "node:test";
import assert from "node:assert/strict";
import { SettlementEngine } from "../src/settlementEngine.js";
import { ELOMarket } from "../src/eloMarket.js";

test("searchListings should support query.dsl filters and hybrid ranking", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);

  engine.registerAgent("providerA", "ownerA");
  engine.registerAgent("providerB", "ownerB");
  engine.registerAgent("consumer", "ownerC");

  market.publishOffer({
    offerId: "offer-seo-free",
    kind: "workflow",
    title: "SEO query optimizer",
    summary: "Optimize prompts and search queries for better token efficiency",
    tags: ["seo", "optimizer", "query"],
    category: "marketing",
    providerAgentId: "providerA",
    serviceId: "workflow/seo-optimizer",
    computeUnits: 80,
    energyKwh: 0.05,
    pricingMode: "free",
    priceElo: 0,
    tokenSavingEstimate: 0.42,
    uptimeSla: 0.99,
  });

  market.publishOffer({
    offerId: "offer-image-paid",
    kind: "api",
    title: "Image enhancement api",
    summary: "Image upscaling and denoise",
    tags: ["image", "upscale"],
    category: "media",
    providerAgentId: "providerB",
    serviceId: "api/image-enhance",
    computeUnits: 200,
    energyKwh: 0.2,
    pricingMode: "per_call",
    priceElo: 0.05,
    tokenSavingEstimate: 0.1,
    uptimeSla: 0.97,
  });

  const result = market.searchListings({
    schemaVersion: "query.dsl.v1",
    query: "seo query optimization",
    filters: {
      kind: ["workflow"],
      categories: ["marketing"],
      pricingMode: ["free"],
      minTokenSaving: 0.3,
      requireHealthy: true,
    },
    sort: { mode: "hybrid", direction: "desc" },
    page: { offset: 0, limit: 10 },
  });

  assert.equal(result.schemaVersion, "market.search.v1");
  assert.equal(result.total, 1);
  assert.equal(result.items[0].offer.offerId, "offer-seo-free");
  assert.ok(result.items[0].score.hybridScore > 0);
});

test("submitReview should require usage receipt and update ratings", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);

  engine.registerAgent("provider", "ownerP");
  engine.registerAgent("consumer", "ownerC");
  engine.recharge("consumer", 10);

  market.publishOffer({
    offerId: "offer-review",
    providerAgentId: "provider",
    serviceId: "skill/reviewable",
    computeUnits: 100,
    energyKwh: 0.1,
    priceElo: 0.01,
  });

  market.purchase({
    offerId: "offer-review",
    consumerAgentId: "consumer",
    requestId: "receipt-1",
  });

  const review = market.submitReview({
    listingId: "offer-review",
    reviewerAgentId: "consumer",
    rating: 5,
    usageReceiptRef: "receipt-1",
    tokenSavingObserved: 0.4,
  });

  assert.equal(review.schemaVersion, "review.v1");
  assert.equal(review.providerOwnerId, "ownerP");

  const listingRating = market.getListingRating("offer-review");
  assert.equal(listingRating.count, 1);
  assert.equal(listingRating.avg, 5);

  assert.throws(
    () =>
      market.submitReview({
        listingId: "offer-review",
        reviewerAgentId: "consumer",
        rating: 4,
        usageReceiptRef: "unknown-receipt",
      }),
    /usageReceiptRef is invalid/
  );
});
