import test from "node:test";
import assert from "node:assert/strict";
import { SettlementEngine } from "../src/settlementEngine.js";

test("same_owner_free should return zero quote", () => {
  const engine = new SettlementEngine();
  engine.registerAgent("a1", "owner1");
  engine.registerAgent("a2", "owner1");

  const quote = engine.quote({
    providerAgentId: "a1",
    consumerAgentId: "a2",
    computeUnits: 999,
    marketMultiplier: 3,
    reputationFactor: 1.2,
  });

  assert.equal(quote.billable, false);
  assert.equal(quote.amount, 0);
  assert.equal(quote.reason, "same_owner_free");
});

test("cross_owner_paid should transfer balances", () => {
  const engine = new SettlementEngine();
  engine.registerAgent("provider", "ownerP");
  engine.registerAgent("consumer", "ownerC");

  engine.recharge("consumer", 10);

  const result = engine.settle({
    providerAgentId: "provider",
    consumerAgentId: "consumer",
    requestId: "req-1",
    computeUnits: 500,
    energyKwh: 0.5,
    marketMultiplier: 1.5,
    reputationFactor: 1.1,
    outcomeBonus: 0,
  });

  assert.equal(result.billable, true);
  assert.ok(result.amount > 0);
  assert.equal(engine.balanceOf("provider"), result.amount);
  assert.equal(engine.balanceOf("consumer"), Math.round((10 - result.amount) * 1_000_000) / 1_000_000);
});

test("insufficient balance should fail cross-owner settlement", () => {
  const engine = new SettlementEngine();
  engine.registerAgent("provider", "ownerP");
  engine.registerAgent("consumer", "ownerC");

  assert.throws(
    () =>
      engine.settle({
        providerAgentId: "provider",
        consumerAgentId: "consumer",
        requestId: "req-2",
        computeUnits: 1_000_000,
        energyKwh: 100,
        marketMultiplier: 5,
        reputationFactor: 2,
      }),
    /insufficient balance/,
  );
});

test("duplicate requestId should fail", () => {
  const engine = new SettlementEngine();
  engine.registerAgent("provider", "ownerP");
  engine.registerAgent("consumer", "ownerC");
  engine.recharge("consumer", 10);

  engine.settle({
    providerAgentId: "provider",
    consumerAgentId: "consumer",
    requestId: "req-dup",
    computeUnits: 100,
    energyKwh: 0.1,
    marketMultiplier: 1,
    reputationFactor: 1,
  });

  assert.throws(
    () =>
      engine.settle({
        providerAgentId: "provider",
        consumerAgentId: "consumer",
        requestId: "req-dup",
        computeUnits: 100,
        energyKwh: 0.1,
        marketMultiplier: 1,
        reputationFactor: 1,
      }),
    /duplicate requestId/,
  );
});
