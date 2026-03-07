import test from "node:test";
import assert from "node:assert/strict";
import { SettlementEngine } from "../src/settlementEngine.js";
import { ELOMarket } from "../src/eloMarket.js";
import { X402Adapter } from "../src/x402Adapter.js";

test("x402 adapter should issue 402 challenge and settle paid payment", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);
  const x402 = new X402Adapter(market);

  engine.registerAgent("provider", "ownerP");
  engine.registerAgent("consumer", "ownerC");
  engine.recharge("consumer", 10);

  market.publishOffer({
    offerId: "offer-x402-paid",
    providerAgentId: "provider",
    serviceId: "api/data-feed",
    computeUnits: 100,
    energyKwh: 0.1,
    marketMultiplier: 1,
  });

  const challenge = x402.createChallenge({
    offerId: "offer-x402-paid",
    consumerAgentId: "consumer",
  });
  assert.equal(challenge.httpStatus, 402);
  assert.equal(challenge.payload.code, "x402_payment_required");
  assert.equal(challenge.payload.requiresPayment, true);

  const paymentId = challenge.payload.payment.paymentId;
  const settled = x402.settlePayment({
    paymentId,
    requestId: "x402-req-1",
  });
  assert.equal(settled.schemaVersion, "x402.settlement.v1");
  assert.equal(settled.billable, true);

  const state = x402.getPayment(paymentId);
  assert.equal(state.state, "settled");
});

test("x402 adapter should return no-payment challenge for same-owner settlement", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);
  const x402 = new X402Adapter(market);

  engine.registerAgent("provider", "ownerX");
  engine.registerAgent("consumer", "ownerX");

  market.publishOffer({
    offerId: "offer-x402-free",
    providerAgentId: "provider",
    serviceId: "workflow/internal",
    computeUnits: 100,
    energyKwh: 0.1,
    marketMultiplier: 1,
  });

  const challenge = x402.createChallenge({
    offerId: "offer-x402-free",
    consumerAgentId: "consumer",
  });

  assert.equal(challenge.httpStatus, 200);
  assert.equal(challenge.payload.code, "x402_not_required");
  assert.equal(challenge.payload.payment.amountElo, 0);
});

test("x402 adapter should reject expired challenge", async () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);
  const x402 = new X402Adapter(market, { defaultTtlMs: 1 });

  engine.registerAgent("provider", "ownerP");
  engine.registerAgent("consumer", "ownerC");
  engine.recharge("consumer", 10);

  market.publishOffer({
    offerId: "offer-expire",
    providerAgentId: "provider",
    serviceId: "api/expire",
    computeUnits: 100,
    energyKwh: 0.1,
    marketMultiplier: 1,
  });

  const challenge = x402.createChallenge({
    offerId: "offer-expire",
    consumerAgentId: "consumer",
  });

  await new Promise((resolve) => setTimeout(resolve, 5));

  assert.throws(
    () =>
      x402.settlePayment({
        paymentId: challenge.payload.payment.paymentId,
        requestId: "x402-expired-1",
      }),
    /(expired|unknown paymentId)/
  );
});

test("x402 adapter should enforce pending payment queue cap", () => {
  const engine = new SettlementEngine();
  const market = new ELOMarket(engine);
  const x402 = new X402Adapter(market, { maxPendingPayments: 1 });

  engine.registerAgent("provider", "ownerP");
  engine.registerAgent("consumer", "ownerC");
  engine.recharge("consumer", 20);

  market.publishOffer({
    offerId: "offer-x402-cap",
    providerAgentId: "provider",
    serviceId: "api/cap",
    computeUnits: 100,
    energyKwh: 0.1,
    marketMultiplier: 1,
  });

  x402.createChallenge({
    offerId: "offer-x402-cap",
    consumerAgentId: "consumer",
  });

  assert.throws(
    () =>
      x402.createChallenge({
        offerId: "offer-x402-cap",
        consumerAgentId: "consumer",
      }),
    /queue is full/
  );
});
