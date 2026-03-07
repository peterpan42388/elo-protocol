import http from "node:http";
import { SettlementEngine } from "./settlementEngine.js";
import { ELOMarket } from "./eloMarket.js";
import { X402Adapter } from "./x402Adapter.js";
import {
  buildDashboardAgents,
  buildDashboardOffers,
  buildDashboardSavings,
  buildDashboardSchemaDescriptor,
  buildDashboardSummary,
  buildDashboardTrades,
} from "./dashboardContract.js";

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  return JSON.parse(raw);
}

export function createApiServer(engine = new SettlementEngine(), market = new ELOMarket(engine)) {
  const x402 = new X402Adapter(market);
  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url || !req.method) return json(res, 400, { error: "bad request" });
      const requestUrl = new URL(req.url, "http://127.0.0.1");
      const path = requestUrl.pathname;

      if (req.method === "POST" && path === "/register-agent") {
        const body = await readJson(req);
        engine.registerAgent(body.agentId, body.ownerId);
        return json(res, 200, { ok: true });
      }

      if (req.method === "POST" && path === "/recharge") {
        const body = await readJson(req);
        engine.recharge(body.agentId, Number(body.amount), body.source ?? "api");
        return json(res, 200, { ok: true, balance: engine.balanceOf(body.agentId) });
      }

      if (req.method === "POST" && path === "/quote") {
        const body = await readJson(req);
        const quote = engine.quote(body);
        return json(res, 200, quote);
      }

      if (req.method === "POST" && path === "/settle") {
        const body = await readJson(req);
        const result = engine.settle(body);
        return json(res, 200, result);
      }

      if (req.method === "POST" && path === "/market/offers/publish") {
        const body = await readJson(req);
        const offer = market.publishOffer(body);
        return json(res, 200, offer);
      }

      if (req.method === "GET" && path === "/market/offers") {
        return json(res, 200, { offers: market.listOffers() });
      }

      if (req.method === "POST" && path === "/market/x402/challenge") {
        const body = await readJson(req);
        const challenge = x402.createChallenge(body);
        return json(res, challenge.httpStatus, challenge.payload);
      }

      if (req.method === "POST" && path === "/market/x402/settle") {
        const body = await readJson(req);
        const result = x402.settlePayment(body);
        return json(res, 200, result);
      }

      if (req.method === "GET" && path.startsWith("/market/x402/payments/")) {
        const paymentId = decodeURIComponent(path.slice("/market/x402/payments/".length));
        return json(res, 200, x402.getPayment(paymentId));
      }

      if (req.method === "POST" && path === "/market/search") {
        const body = await readJson(req);
        const result = market.searchListings(body);
        return json(res, 200, result);
      }

      if (req.method === "POST" && path === "/market/quote") {
        const body = await readJson(req);
        const quote = market.quotePurchase(body);
        return json(res, 200, quote);
      }

      if (req.method === "POST" && path === "/market/purchase") {
        const body = await readJson(req);
        const result = market.purchase(body);
        return json(res, 200, result);
      }

      if (req.method === "POST" && path === "/market/savings-simulate") {
        const body = await readJson(req);
        const result = market.simulateOptimization(body);
        return json(res, 200, result);
      }

      if (req.method === "POST" && path === "/market/reviews/submit") {
        const body = await readJson(req);
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
        const body = await readJson(req);
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

      if (req.method === "GET" && path === "/dashboard/schema") {
        return json(res, 200, buildDashboardSchemaDescriptor());
      }

      if (req.method === "GET" && path.startsWith("/balance/")) {
        const agentId = decodeURIComponent(path.slice("/balance/".length));
        return json(res, 200, { agentId, balance: engine.balanceOf(agentId) });
      }

      return json(res, 404, { error: "not found" });
    } catch (error) {
      return json(res, 400, { error: error.message });
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
