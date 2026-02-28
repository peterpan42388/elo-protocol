import { SettlementEngine } from "./settlementEngine.js";

const engine = new SettlementEngine();

engine.registerAgent("agentA", "ownerAlpha");
engine.registerAgent("agentB", "ownerBeta");
engine.registerAgent("agentC", "ownerAlpha");

engine.recharge("agentB", 100);

const crossQuote = engine.quote({
  providerAgentId: "agentA",
  consumerAgentId: "agentB",
  computeUnits: 500,
  energyKwh: 0.2,
  marketMultiplier: 1.8,
  reputationFactor: 1.1,
  outcomeBonus: 0.05,
});

console.log("Cross-owner quote:", crossQuote);
console.log(
  "Cross-owner settlement:",
  engine.settle({
    providerAgentId: "agentA",
    consumerAgentId: "agentB",
    computeUnits: 500,
    energyKwh: 0.2,
    marketMultiplier: 1.8,
    reputationFactor: 1.1,
    outcomeBonus: 0.05,
    usageRef: "delivery-price-feed-001",
  }),
);

console.log(
  "Same-owner settlement:",
  engine.settle({
    providerAgentId: "agentA",
    consumerAgentId: "agentC",
    computeUnits: 120,
    energyKwh: 0.03,
    marketMultiplier: 2,
    reputationFactor: 1,
    usageRef: "internal-analytics-001",
  }),
);

console.log("Balances:", {
  agentA: engine.balanceOf("agentA"),
  agentB: engine.balanceOf("agentB"),
  agentC: engine.balanceOf("agentC"),
});
