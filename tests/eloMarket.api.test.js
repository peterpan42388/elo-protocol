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

test("market API should publish, quote and purchase offers", async () => {
  const { server } = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  await post(base, "/register-agent", { agentId: "provider", ownerId: "ownerP" });
  await post(base, "/register-agent", { agentId: "consumer", ownerId: "ownerC" });
  await post(base, "/recharge", { agentId: "consumer", amount: 10 });

  const pub = await post(base, "/market/offers/publish", {
    offerId: "offer-api-1",
    providerAgentId: "provider",
    serviceId: "api/optimizer",
    computeUnits: 150,
    energyKwh: 0.1,
    marketMultiplier: 1.2,
  });
  assert.equal(pub.status, 200);

  const q = await post(base, "/market/quote", {
    offerId: "offer-api-1",
    consumerAgentId: "consumer",
  });
  assert.equal(q.status, 200);
  assert.equal(q.body.offerId, "offer-api-1");

  const buy = await post(base, "/market/purchase", {
    offerId: "offer-api-1",
    consumerAgentId: "consumer",
    requestId: "market-api-req-1",
  });
  assert.equal(buy.status, 200);
  assert.equal(buy.body.billable, true);

  const listResp = await fetch(`${base}/market/offers`);
  const list = await listResp.json();
  assert.equal(Array.isArray(list.offers), true);
  assert.equal(list.offers.length, 1);

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});
