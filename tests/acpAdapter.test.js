import test from "node:test";
import assert from "node:assert/strict";
import { SettlementEngine } from "../src/settlementEngine.js";
import { ELOMarket } from "../src/eloMarket.js";
import { ACPAdapter } from "../src/acpAdapter.js";

test("ACP adapter should execute cross-owner intent with funded escrow", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);
  const acp = new ACPAdapter(market, engine);

  engine.registerAgent("provider", "ownerP");
  engine.registerAgent("buyer", "ownerB");
  engine.recharge("buyer", 20);

  market.publishOffer({
    offerId: "offer-acp-paid",
    providerAgentId: "provider",
    serviceId: "workflow/optimizer",
    computeUnits: 100,
    energyKwh: 0.1,
    marketMultiplier: 1,
  });

  const intent = acp.openIntent({
    offerId: "offer-acp-paid",
    buyerAgentId: "buyer",
    units: 1,
  });
  assert.equal(intent.status, "proposed");

  const accepted = acp.acceptIntent(intent.intentId);
  assert.equal(accepted.escrow.state, "awaiting_fund");

  const funded = acp.fundEscrow(accepted.escrow.escrowId, { buyerAgentId: "buyer" });
  assert.equal(funded.state, "funded");

  const executed = acp.executeEscrow(accepted.escrow.escrowId, {
    requestId: "acp-req-1",
    usageRef: "acp-test",
  });
  assert.equal(executed.schemaVersion, "acp.execution.v1");
  assert.equal(executed.trade.billable, true);

  const intentState = acp.getIntent(intent.intentId);
  assert.equal(intentState.status, "completed");

  const escrowState = acp.getEscrow(accepted.escrow.escrowId);
  assert.equal(escrowState.state, "executed");
});

test("ACP adapter should allow same-owner execution without escrow funding", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);
  const acp = new ACPAdapter(market, engine);

  engine.registerAgent("provider", "ownerX");
  engine.registerAgent("buyer", "ownerX");

  market.publishOffer({
    offerId: "offer-acp-free",
    providerAgentId: "provider",
    serviceId: "workflow/internal",
    computeUnits: 100,
    energyKwh: 0.1,
    marketMultiplier: 1,
  });

  const intent = acp.openIntent({
    offerId: "offer-acp-free",
    buyerAgentId: "buyer",
  });
  const accepted = acp.acceptIntent(intent.intentId);
  assert.equal(accepted.escrow.billable, false);
  assert.equal(accepted.escrow.state, "funded");

  const executed = acp.executeEscrow(accepted.escrow.escrowId, {
    requestId: "acp-free-req-1",
  });

  assert.equal(executed.trade.billable, false);
  assert.equal(executed.trade.amount, 0);
});

test("ACP adapter should enforce intent queue cap and cleanup stale proposed intents", async () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);
  const acp = new ACPAdapter(market, engine, {
    maxIntents: 1,
    terminalRetentionMs: 1,
  });

  engine.registerAgent("provider", "ownerP");
  engine.registerAgent("buyer", "ownerB");
  engine.recharge("buyer", 10);

  market.publishOffer({
    offerId: "offer-acp-cap",
    providerAgentId: "provider",
    serviceId: "workflow/cap",
    computeUnits: 100,
    energyKwh: 0.1,
    marketMultiplier: 1,
  });

  acp.openIntent({
    offerId: "offer-acp-cap",
    buyerAgentId: "buyer",
  });

  assert.throws(
    () =>
      acp.openIntent({
        offerId: "offer-acp-cap",
        buyerAgentId: "buyer",
      }),
    /queue is full/
  );

  await new Promise((resolve) => setTimeout(resolve, 5));

  const reopened = acp.openIntent({
    offerId: "offer-acp-cap",
    buyerAgentId: "buyer",
  });
  assert.equal(reopened.status, "proposed");
});
