import http from "node:http";
import { SettlementEngine } from "./settlementEngine.js";
import { ELOMarket } from "./eloMarket.js";
import { X402Adapter } from "./x402Adapter.js";
import { ACPAdapter } from "./acpAdapter.js";
import {
  buildDashboardAgents,
  buildDashboardMarketEfficiency,
  buildDashboardOutcomes,
  buildDashboardOffers,
  buildDashboardSavings,
  buildDashboardSchemaDescriptor,
  buildDashboardSummary,
  buildDashboardTrades,
} from "./dashboardContract.js";

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function json(res, status, payload, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  };
  res.writeHead(status, headers);
  res.end(JSON.stringify(payload));
}

function parseIntSafe(value, fallback) {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function positiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function getClientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

function createRateLimiter({ windowMs, maxRequests }) {
  const buckets = new Map();
  let tick = 0;

  function cleanup(now) {
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  return {
    check(key) {
      if (!Number.isFinite(maxRequests) || maxRequests <= 0) {
        return { allowed: true, remaining: Infinity, retryAfterMs: 0 };
      }

      const now = Date.now();
      let bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        bucket = { count: 0, resetAt: now + windowMs };
        buckets.set(key, bucket);
      }

      bucket.count += 1;
      const allowed = bucket.count <= maxRequests;
      const retryAfterMs = allowed ? 0 : Math.max(0, bucket.resetAt - now);
      const remaining = Math.max(0, maxRequests - bucket.count);

      tick += 1;
      if (tick % 200 === 0) cleanup(now);

      return { allowed, remaining, retryAfterMs };
    },
  };
}

function ensureJsonRequest(req) {
  const ct = String(req.headers["content-type"] ?? "").toLowerCase();
  if (!ct.includes("application/json")) {
    throw new HttpError(415, "content-type must be application/json");
  }
}

async function readJson(req, maxBytes) {
  let raw = "";
  let total = 0;
  for await (const chunk of req) {
    total += Buffer.byteLength(chunk);
    if (total > maxBytes) {
      throw new HttpError(413, "request body too large");
    }
    raw += chunk;
  }
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new HttpError(400, "json body must be an object");
    }
    return parsed;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "invalid json body");
  }
}

export function createApiServer(engine = new SettlementEngine(), market = new ELOMarket(engine), options = {}) {
  const bodyMaxBytes = positiveInt(
    Number.isFinite(options.bodyMaxBytes)
      ? Number(options.bodyMaxBytes)
      : parseIntSafe(process.env.API_BODY_MAX_BYTES, 64 * 1024),
    64 * 1024
  );
  const rateLimitWindowMs = positiveInt(
    Number.isFinite(options.rateLimitWindowMs)
      ? Number(options.rateLimitWindowMs)
      : parseIntSafe(process.env.API_RATE_LIMIT_WINDOW_MS, 60_000),
    60_000
  );
  const rateLimitMaxRequests = positiveInt(
    Number.isFinite(options.rateLimitMaxRequests)
      ? Number(options.rateLimitMaxRequests)
      : parseIntSafe(process.env.API_RATE_LIMIT_MAX, 2000),
    2000
  );

  const limiter = createRateLimiter({
    windowMs: rateLimitWindowMs,
    maxRequests: rateLimitMaxRequests,
  });

  const x402 = new X402Adapter(market);
  const acp = new ACPAdapter(market, engine);
  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url || !req.method) return json(res, 400, { error: "bad request" });
      const requestUrl = new URL(req.url, "http://127.0.0.1");
      const path = requestUrl.pathname;
      const clientKey = getClientKey(req);
      const rate = limiter.check(clientKey);
      if (!rate.allowed) {
        return json(
          res,
          429,
          { error: "rate limit exceeded", retryAfterMs: rate.retryAfterMs },
          { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000) || 1) }
        );
      }

      if (req.method === "POST") ensureJsonRequest(req);

      if (req.method === "POST" && path === "/register-agent") {
        const body = await readJson(req, bodyMaxBytes);
        engine.registerAgent(body.agentId, body.ownerId);
        return json(res, 200, { ok: true });
      }

      if (req.method === "POST" && path === "/recharge") {
        const body = await readJson(req, bodyMaxBytes);
        engine.recharge(body.agentId, Number(body.amount), body.source ?? "api");
        return json(res, 200, { ok: true, balance: engine.balanceOf(body.agentId) });
      }

      if (req.method === "POST" && path === "/quote") {
        const body = await readJson(req, bodyMaxBytes);
        const quote = engine.quote(body);
        return json(res, 200, quote);
      }

      if (req.method === "POST" && path === "/settle") {
        const body = await readJson(req, bodyMaxBytes);
        const result = engine.settle(body);
        return json(res, 200, result);
      }

      if (req.method === "POST" && path === "/market/offers/publish") {
        const body = await readJson(req, bodyMaxBytes);
        const offer = market.publishOffer(body);
        return json(res, 200, offer);
      }

      if (req.method === "GET" && path === "/market/offers") {
        return json(res, 200, { offers: market.listOffers() });
      }

      if (req.method === "POST" && path === "/market/acp/intents/open") {
        const body = await readJson(req, bodyMaxBytes);
        const result = acp.openIntent(body);
        return json(res, 200, result);
      }

      if (req.method === "POST" && path.startsWith("/market/acp/intents/") && path.endsWith("/accept")) {
        const intentId = decodeURIComponent(path.slice("/market/acp/intents/".length, -"/accept".length));
        const body = await readJson(req, bodyMaxBytes);
        const result = acp.acceptIntent(intentId, body);
        return json(res, 200, result);
      }

      if (req.method === "GET" && path.startsWith("/market/acp/intents/")) {
        const intentId = decodeURIComponent(path.slice("/market/acp/intents/".length));
        return json(res, 200, acp.getIntent(intentId));
      }

      if (req.method === "POST" && path.startsWith("/market/acp/escrow/") && path.endsWith("/fund")) {
        const escrowId = decodeURIComponent(path.slice("/market/acp/escrow/".length, -"/fund".length));
        const body = await readJson(req, bodyMaxBytes);
        const result = acp.fundEscrow(escrowId, body);
        return json(res, 200, result);
      }

      if (req.method === "POST" && path.startsWith("/market/acp/escrow/") && path.endsWith("/execute")) {
        const escrowId = decodeURIComponent(path.slice("/market/acp/escrow/".length, -"/execute".length));
        const body = await readJson(req, bodyMaxBytes);
        const result = acp.executeEscrow(escrowId, body);
        return json(res, 200, result);
      }

      if (req.method === "GET" && path.startsWith("/market/acp/escrow/")) {
        const escrowId = decodeURIComponent(path.slice("/market/acp/escrow/".length));
        return json(res, 200, acp.getEscrow(escrowId));
      }

      if (req.method === "POST" && path === "/market/x402/challenge") {
        const body = await readJson(req, bodyMaxBytes);
        const challenge = x402.createChallenge(body);
        return json(res, challenge.httpStatus, challenge.payload);
      }

      if (req.method === "POST" && path === "/market/x402/settle") {
        const body = await readJson(req, bodyMaxBytes);
        const result = x402.settlePayment(body);
        return json(res, 200, result);
      }

      if (req.method === "GET" && path.startsWith("/market/x402/payments/")) {
        const paymentId = decodeURIComponent(path.slice("/market/x402/payments/".length));
        return json(res, 200, x402.getPayment(paymentId));
      }

      if (req.method === "POST" && path === "/market/search") {
        const body = await readJson(req, bodyMaxBytes);
        const result = market.searchListings(body);
        return json(res, 200, result);
      }

      if (req.method === "POST" && path === "/market/quote") {
        const body = await readJson(req, bodyMaxBytes);
        const quote = market.quotePurchase(body);
        return json(res, 200, quote);
      }

      if (req.method === "POST" && path === "/market/purchase") {
        const body = await readJson(req, bodyMaxBytes);
        const result = market.purchase(body);
        return json(res, 200, result);
      }

      if (req.method === "POST" && path === "/market/savings-simulate") {
        const body = await readJson(req, bodyMaxBytes);
        const result = market.simulateOptimization(body);
        return json(res, 200, result);
      }

      if (req.method === "POST" && path === "/market/reviews/submit") {
        const body = await readJson(req, bodyMaxBytes);
        const result = market.submitReview(body);
        return json(res, 200, result);
      }

      if (req.method === "GET" && path === "/market/reviews") {
        const listingId = requestUrl.searchParams.get("listingId") ?? undefined;
        const providerOwnerId = requestUrl.searchParams.get("providerOwnerId") ?? undefined;
        return json(res, 200, { reviews: market.listReviews({ listingId, providerOwnerId }) });
      }

      if (req.method === "GET" && path.startsWith("/market/ratings/listing/")) {
        const listingId = decodeURIComponent(path.slice("/market/ratings/listing/".length));
        return json(res, 200, { listingId, ...market.getListingRating(listingId) });
      }

      if (req.method === "GET" && path.startsWith("/market/ratings/provider/")) {
        const providerOwnerId = decodeURIComponent(path.slice("/market/ratings/provider/".length));
        return json(res, 200, { providerOwnerId, ...market.getProviderRating(providerOwnerId) });
      }

      if (req.method === "POST" && path === "/market/evaluations/submit") {
        const body = await readJson(req, bodyMaxBytes);
        const result = market.evaluateTrade(body);
        return json(res, 200, result);
      }

      if (req.method === "GET" && path === "/market/evaluations") {
        const listingId = requestUrl.searchParams.get("listingId") ?? undefined;
        const providerOwnerId = requestUrl.searchParams.get("providerOwnerId") ?? undefined;
        return json(res, 200, { evaluations: market.listEvaluations({ listingId, providerOwnerId }) });
      }

      if (req.method === "GET" && path.startsWith("/market/outcomes/listing/")) {
        const listingId = decodeURIComponent(path.slice("/market/outcomes/listing/".length));
        return json(res, 200, { listingId, ...market.getListingOutcome(listingId) });
      }

      if (req.method === "GET" && path.startsWith("/market/outcomes/provider/")) {
        const providerOwnerId = decodeURIComponent(path.slice("/market/outcomes/provider/".length));
        return json(res, 200, { providerOwnerId, ...market.getProviderOutcome(providerOwnerId) });
      }

      if (req.method === "GET" && path === "/dashboard/summary") {
        return json(res, 200, buildDashboardSummary(engine, market));
      }

      if (req.method === "GET" && path === "/dashboard/agents") {
        return json(res, 200, buildDashboardAgents(engine));
      }

      if (req.method === "GET" && path === "/dashboard/offers") {
        return json(res, 200, buildDashboardOffers(engine, market));
      }

      if (req.method === "GET" && path === "/dashboard/trades") {
        const limit = Number(requestUrl.searchParams.get("limit") ?? "100");
        return json(res, 200, buildDashboardTrades(engine, market, limit));
      }

      if (req.method === "GET" && path === "/dashboard/savings") {
        return json(res, 200, buildDashboardSavings(market));
      }

      if (req.method === "GET" && path === "/dashboard/market-efficiency") {
        const limit = Number(requestUrl.searchParams.get("limit") ?? "20");
        return json(res, 200, buildDashboardMarketEfficiency(engine, market, limit));
      }

      if (req.method === "GET" && path === "/dashboard/outcomes") {
        const limit = Number(requestUrl.searchParams.get("limit") ?? "100");
        return json(res, 200, buildDashboardOutcomes(market, limit));
      }

      if (req.method === "GET" && path === "/dashboard/schema") {
        return json(res, 200, buildDashboardSchemaDescriptor());
      }

      if (req.method === "GET" && path.startsWith("/balance/")) {
        const agentId = decodeURIComponent(path.slice("/balance/".length));
        return json(res, 200, { agentId, balance: engine.balanceOf(agentId) });
      }

      return json(res, 404, { error: "not found" });
    } catch (error) {
      const status = Number.isInteger(error?.statusCode) ? error.statusCode : 400;
      return json(res, status, { error: error.message });
    }
  });

  return { server, engine, market };
}

if (process.argv[1] && process.argv[1].endsWith("apiServer.js")) {
  const { server } = createApiServer();
  const port = Number(process.env.PORT || 8787);
  server.listen(port, () => {
    console.log(`ELO API server listening on :${port}`);
  });
}
