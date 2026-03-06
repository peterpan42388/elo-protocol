import { SettlementEngine } from "./settlementEngine.js";
import { ELOMarket } from "./eloMarket.js";

const engine = new SettlementEngine();
const market = new ELOMarket(engine);

engine.registerAgent("provider-data", "owner-provider");
engine.registerAgent("provider-llm", "owner-llm");
engine.registerAgent("consumer-agent", "owner-consumer");
engine.recharge("consumer-agent", 10);

market.publishOffer({
  offerId: "offer-food-price-v1",
  providerAgentId: "provider-data",
  serviceId: "food-price-stream",
  computeUnits: 120,
  energyKwh: 0.1,
  marketMultiplier: 1,
  metadata: { domain: "food", latencyMs: 120 },
});

const savings = market.simulateOptimization({
  offerId: "offer-food-price-v1",
  consumerAgentId: "consumer-agent",
  baseline: {
    providerAgentId: "provider-llm",
    computeUnits: 1000,
    energyKwh: 1,
    marketMultiplier: 1.5,
  },
  optimized: {
    providerAgentId: "provider-llm",
    computeUnits: 600,
    energyKwh: 0.6,
    marketMultiplier: 1.5,
  },
});

const trade = market.purchase({
  offerId: "offer-food-price-v1",
  consumerAgentId: "consumer-agent",
  requestId: "market-demo-req-1",
  usageRef: "demo-food-skill",
});

console.log("Market savings simulation:", savings);
console.log("Purchase settlement:", trade);
console.log("Balances:", {
  providerData: engine.balanceOf("provider-data"),
  consumer: engine.balanceOf("consumer-agent"),
});
