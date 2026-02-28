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

test("API should settle paid and free paths correctly", async () => {
  const { server } = createApiServer();

  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  await post(base, "/register-agent", { agentId: "a", ownerId: "owner1" });
  await post(base, "/register-agent", { agentId: "b", ownerId: "owner2" });
  await post(base, "/register-agent", { agentId: "c", ownerId: "owner1" });

  const re = await post(base, "/recharge", { agentId: "b", amount: 20 });
  assert.equal(re.status, 200);

  const paid = await post(base, "/settle", {
    providerAgentId: "a",
    consumerAgentId: "b",
    computeUnits: 200,
    energyKwh: 0.1,
    marketMultiplier: 2,
    reputationFactor: 1,
    usageRef: "cross-001",
  });
  assert.equal(paid.status, 200);
  assert.equal(paid.body.billable, true);
  assert.ok(paid.body.amount > 0);

  const free = await post(base, "/settle", {
    providerAgentId: "a",
    consumerAgentId: "c",
    computeUnits: 999,
    energyKwh: 2,
    marketMultiplier: 4,
    reputationFactor: 3,
    usageRef: "same-001",
  });
  assert.equal(free.status, 200);
  assert.equal(free.body.billable, false);
  assert.equal(free.body.amount, 0);

  const balResp = await fetch(`${base}/balance/a`);
  const bal = await balResp.json();
  assert.ok(bal.balance > 0);

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});
