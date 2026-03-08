import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
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

test("API should enforce max tracked clients cap in limiter", async () => {
  const app = await startServer({
    rateLimitWindowMs: 60_000,
    rateLimitMaxRequests: 100,
    rateLimitMaxClients: 1,
  });
  try {
    const first = await fetch(`${app.base}/dashboard/schema`, {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });
    assert.equal(first.status, 200);

    const second = await fetch(`${app.base}/dashboard/schema`, {
      headers: { "x-forwarded-for": "10.0.0.2" },
    });
    assert.equal(second.status, 429);
    const body = await second.json();
    assert.match(body.error, /rate limit exceeded/);
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

test("API should enforce optional bearer auth on POST endpoints", async () => {
  const app = await startServer({ authBearerToken: "elo-test-token" });
  try {
    const noAuth = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: "agent-sec-1", ownerId: "owner-sec-1" }),
    });
    assert.equal(noAuth.status, 401);

    const wrongAuth = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer wrong-token",
      },
      body: JSON.stringify({ agentId: "agent-sec-2", ownerId: "owner-sec-2" }),
    });
    assert.equal(wrongAuth.status, 401);

    const ok = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer elo-test-token",
      },
      body: JSON.stringify({ agentId: "agent-sec-3", ownerId: "owner-sec-3" }),
    });
    assert.equal(ok.status, 200);

    const readOnly = await fetch(`${app.base}/dashboard/schema`);
    assert.equal(readOnly.status, 200);
  } finally {
    await app.close();
  }
});

function signHmac({ method, path, ts, secret }) {
  const canonical = `${method}\n${path}\n${ts}`;
  const digest = crypto.createHmac("sha256", secret).update(canonical).digest("hex");
  return `sha256=${digest}`;
}

test("API should enforce optional HMAC auth on POST endpoints", async () => {
  const secret = "elo-hmac-test-secret";
  const app = await startServer({ authHmacSecret: secret, authHmacWindowMs: 60_000 });
  try {
    const noHmac = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: "agent-h1", ownerId: "owner-h1" }),
    });
    assert.equal(noHmac.status, 401);

    const ts = Date.now().toString();
    const badSig = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ELO-Timestamp": ts,
        "X-ELO-Signature": "sha256=bad",
      },
      body: JSON.stringify({ agentId: "agent-h2", ownerId: "owner-h2" }),
    });
    assert.equal(badSig.status, 401);

    const goodSig = signHmac({ method: "POST", path: "/register-agent", ts, secret });
    const ok = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ELO-Timestamp": ts,
        "X-ELO-Signature": goodSig,
      },
      body: JSON.stringify({ agentId: "agent-h3", ownerId: "owner-h3" }),
    });
    assert.equal(ok.status, 200);
  } finally {
    await app.close();
  }
});

test("API should enforce bearer + HMAC together when both are configured", async () => {
  const secret = "elo-hmac-combo-secret";
  const bearer = "elo-bearer-combo-token";
  const app = await startServer({
    authBearerToken: bearer,
    authHmacSecret: secret,
    authHmacWindowMs: 60_000,
  });

  try {
    const ts = Date.now().toString();
    const sig = signHmac({ method: "POST", path: "/register-agent", ts, secret });

    const hmacOnly = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ELO-Timestamp": ts,
        "X-ELO-Signature": sig,
      },
      body: JSON.stringify({ agentId: "agent-c1", ownerId: "owner-c1" }),
    });
    assert.equal(hmacOnly.status, 401);

    const bearerOnly = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({ agentId: "agent-c2", ownerId: "owner-c2" }),
    });
    assert.equal(bearerOnly.status, 401);

    const both = await fetch(`${app.base}/register-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`,
        "X-ELO-Timestamp": ts,
        "X-ELO-Signature": sig,
      },
      body: JSON.stringify({ agentId: "agent-c3", ownerId: "owner-c3" }),
    });
    assert.equal(both.status, 200);
  } finally {
    await app.close();
  }
});
