import test from "node:test";
import assert from "node:assert/strict";
import { createApiServer } from "../src/apiServer.js";

async function startServer(options = {}) {
  const { server } = createApiServer(undefined, undefined, options);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  return {
    base: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

test("API should enforce rate limiting", async () => {
  const app = await startServer({ rateLimitWindowMs: 60_000, rateLimitMaxRequests: 2 });
  try {
    const r1 = await fetch(`${app.base}/dashboard/schema`);
    const r2 = await fetch(`${app.base}/dashboard/schema`);
    const r3 = await fetch(`${app.base}/dashboard/schema`);

    assert.equal(r1.status, 200);
    assert.equal(r2.status, 200);
    assert.equal(r3.status, 429);
    const body = await r3.json();
    assert.match(body.error, /rate limit exceeded/);
    assert.ok(Number(body.retryAfterMs) >= 0);
  } finally {
    await app.close();
  }
});

test("API should reject non-json content-type on POST", async () => {
  const app = await startServer();
  try {
    const res = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: '{"agentId":"a","ownerId":"owner1"}',
    });
    assert.equal(res.status, 415);
    const body = await res.json();
    assert.match(body.error, /content-type/i);
  } finally {
    await app.close();
  }
});

test("API should reject oversized JSON payloads", async () => {
  const app = await startServer({ bodyMaxBytes: 64 });
  try {
    const hugeBody = JSON.stringify({
      agentId: "agent-a",
      ownerId: `owner-${"x".repeat(256)}`,
    });
    const res = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: hugeBody,
    });
    assert.equal(res.status, 413);
    const body = await res.json();
    assert.match(body.error, /too large/i);
  } finally {
    await app.close();
  }
});

test("API should reject invalid numeric and token fields", async () => {
  const app = await startServer();
  try {
    const r1 = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: "agent-a", ownerId: "owner-a" }),
    });
    assert.equal(r1.status, 200);

    const recharge = await fetch(`${app.base}/recharge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: "agent-a", amount: "NaN" }),
    });
    assert.equal(recharge.status, 400);
    const rechargeBody = await recharge.json();
    assert.match(rechargeBody.error, /finite number/i);

    const settle = await fetch(`${app.base}/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerAgentId: "agent-a",
        consumerAgentId: "agent-a",
        requestId: "bad request id",
        computeUnits: 1,
        energyKwh: 0.01,
      }),
    });
    assert.equal(settle.status, 400);
    const settleBody = await settle.json();
    assert.match(settleBody.error, /invalid characters/i);
  } finally {
    await app.close();
  }
});
