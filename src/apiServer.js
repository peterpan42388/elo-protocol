import http from "node:http";
import { SettlementEngine } from "./settlementEngine.js";

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

export function createApiServer(engine = new SettlementEngine()) {
  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url || !req.method) return json(res, 400, { error: "bad request" });

      if (req.method === "POST" && req.url === "/register-agent") {
        const body = await readJson(req);
        engine.registerAgent(body.agentId, body.ownerId);
        return json(res, 200, { ok: true });
      }

      if (req.method === "POST" && req.url === "/recharge") {
        const body = await readJson(req);
        engine.recharge(body.agentId, Number(body.amount), body.source ?? "api");
        return json(res, 200, { ok: true, balance: engine.balanceOf(body.agentId) });
      }

      if (req.method === "POST" && req.url === "/quote") {
        const body = await readJson(req);
        const quote = engine.quote(body);
        return json(res, 200, quote);
      }

      if (req.method === "POST" && req.url === "/settle") {
        const body = await readJson(req);
        const result = engine.settle(body);
        return json(res, 200, result);
      }

      if (req.method === "GET" && req.url.startsWith("/balance/")) {
        const agentId = decodeURIComponent(req.url.slice("/balance/".length));
        return json(res, 200, { agentId, balance: engine.balanceOf(agentId) });
      }

      return json(res, 404, { error: "not found" });
    } catch (error) {
      return json(res, 400, { error: error.message });
    }
  });

  return { server, engine };
}

if (process.argv[1] && process.argv[1].endsWith("apiServer.js")) {
  const { server } = createApiServer();
  const port = Number(process.env.PORT || 8787);
  server.listen(port, () => {
    console.log(`ELO API server listening on :${port}`);
  });
}
