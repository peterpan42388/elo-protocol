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

test("market search and review APIs should follow query/review flow", async () => {
  const { server } = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  await post(base, "/register-agent", { agentId: "provider", ownerId: "ownerP" });
  await post(base, "/register-agent", { agentId: "consumer", ownerId: "ownerC" });
  await post(base, "/recharge", { agentId: "consumer", amount: 20 });

  await post(base, "/market/offers/publish", {
    offerId: "offer-search-api",
    kind: "workflow",
    title: "SEO workflow",
    summary: "SEO optimization workflow for query prompts",
    tags: ["seo", "workflow"],
    category: "marketing",
    providerAgentId: "provider",
    serviceId: "workflow/seo",
    computeUnits: 100,
    energyKwh: 0.1,
    pricingMode: "free",
    priceElo: 0,
    tokenSavingEstimate: 0.35,
  });

  const search = await post(base, "/market/search", {
    schemaVersion: "query.dsl.v1",
    query: "seo query optimizer",
    filters: {
      kind: ["workflow"],
      categories: ["marketing"],
      pricingMode: ["free"],
      requireHealthy: true,
    },
    sort: { mode: "hybrid", direction: "desc" },
    page: { offset: 0, limit: 10 },
  });
  assert.equal(search.status, 200);
  assert.equal(search.body.schemaVersion, "market.search.v1");
  assert.equal(search.body.total, 1);

  const buy = await post(base, "/market/purchase", {
    offerId: "offer-search-api",
    consumerAgentId: "consumer",
    requestId: "api-review-receipt-1",
  });
  assert.equal(buy.status, 200);

  const review = await post(base, "/market/reviews/submit", {
    listingId: "offer-search-api",
    reviewerAgentId: "consumer",
    rating: 5,
    usageReceiptRef: "api-review-receipt-1",
  });
  assert.equal(review.status, 200);

  const ratings = await get(base, "/market/ratings/listing/offer-search-api");
  assert.equal(ratings.status, 200);
  assert.equal(ratings.body.avg, 5);

  const reviews = await get(base, "/market/reviews?listingId=offer-search-api");
  assert.equal(reviews.status, 200);
  assert.equal(reviews.body.reviews.length, 1);

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});
