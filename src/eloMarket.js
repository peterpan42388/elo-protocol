import { SettlementEngine } from "./settlementEngine.js";

export class ELOMarket {
  constructor(engine = new SettlementEngine()) {
    this.engine = engine;
    this.offers = new Map();
    this.trades = [];
  }

  publishOffer(params) {
    const {
      offerId,
      providerAgentId,
      serviceId,
      computeUnits,
      energyKwh,
      marketMultiplier = 1,
      metadata = {},
    } = params;

    if (!offerId || !providerAgentId || !serviceId) {
      throw new Error("offerId, providerAgentId and serviceId are required");
    }
    if (this.offers.has(offerId)) {
      throw new Error(`duplicate offerId: ${offerId}`);
    }

    this.engine.ownerOf(providerAgentId);

    if (!Number.isFinite(computeUnits) || computeUnits < 0) {
      throw new Error("computeUnits must be >= 0");
    }
    if (!Number.isFinite(energyKwh) || energyKwh < 0) {
      throw new Error("energyKwh must be >= 0");
    }
    if (!Number.isFinite(marketMultiplier) || marketMultiplier <= 0) {
      throw new Error("marketMultiplier must be > 0");
    }

    const offer = {
      offerId,
      providerAgentId,
      serviceId,
      computeUnits,
      energyKwh,
      marketMultiplier,
      metadata,
      createdAt: Date.now(),
    };

    this.offers.set(offerId, offer);
    return offer;
  }

  listOffers() {
    return [...this.offers.values()].sort((a, b) => a.createdAt - b.createdAt);
  }

  quotePurchase(params) {
    const {
      offerId,
      consumerAgentId,
      units = 1,
      reputationFactor = 1,
      outcomeBonus = 0,
      marketMultiplier,
    } = params;

    const offer = this._offer(offerId);
    this.engine.ownerOf(consumerAgentId);

    if (!Number.isInteger(units) || units <= 0) {
      throw new Error("units must be a positive integer");
    }

    const quote = this.engine.quote({
      providerAgentId: offer.providerAgentId,
      consumerAgentId,
      computeUnits: offer.computeUnits * units,
      energyKwh: offer.energyKwh * units,
      marketMultiplier: marketMultiplier ?? offer.marketMultiplier,
      reputationFactor,
      outcomeBonus,
    });

    return {
      ...quote,
      offerId,
      serviceId: offer.serviceId,
      units,
    };
  }

  purchase(params) {
    const {
      offerId,
      consumerAgentId,
      requestId,
      usageRef = "market_purchase",
      units = 1,
      reputationFactor = 1,
      outcomeBonus = 0,
      marketMultiplier,
    } = params;

    const offer = this._offer(offerId);
    const result = this.engine.settle({
      providerAgentId: offer.providerAgentId,
      consumerAgentId,
      requestId,
      usageRef,
      computeUnits: offer.computeUnits * units,
      energyKwh: offer.energyKwh * units,
      marketMultiplier: marketMultiplier ?? offer.marketMultiplier,
      reputationFactor,
      outcomeBonus,
    });

    this.trades.push({
      offerId,
      serviceId: offer.serviceId,
      consumerAgentId,
      requestId,
      amount: result.amount,
      billable: result.billable,
      ts: result.ts,
    });

    return result;
  }

  simulateOptimization(params) {
    const {
      offerId,
      consumerAgentId,
      baseline,
      optimized,
      units = 1,
      reputationFactor = 1,
      outcomeBonus = 0,
      marketMultiplier,
    } = params;

    if (!baseline || !optimized) {
      throw new Error("baseline and optimized workloads are required");
    }

    const offer = this._offer(offerId);
    const purchaseQuote = this.quotePurchase({
      offerId,
      consumerAgentId,
      units,
      reputationFactor,
      outcomeBonus,
      marketMultiplier,
    });

    const baselineQuote = this.engine.quote({
      providerAgentId: baseline.providerAgentId,
      consumerAgentId,
      computeUnits: baseline.computeUnits,
      energyKwh: baseline.energyKwh,
      marketMultiplier: baseline.marketMultiplier,
      reputationFactor: baseline.reputationFactor ?? 1,
      outcomeBonus: baseline.outcomeBonus ?? 0,
    });

    const optimizedQuote = this.engine.quote({
      providerAgentId: optimized.providerAgentId,
      consumerAgentId,
      computeUnits: optimized.computeUnits,
      energyKwh: optimized.energyKwh,
      marketMultiplier: optimized.marketMultiplier,
      reputationFactor: optimized.reputationFactor ?? 1,
      outcomeBonus: optimized.outcomeBonus ?? 0,
    });

    const totalWithMarket = this._round(purchaseQuote.amount + optimizedQuote.amount);
    const savingsAmount = this._round(baselineQuote.amount - totalWithMarket);
    const savingsRate = baselineQuote.amount > 0 ? this._round(savingsAmount / baselineQuote.amount) : 0;

    return {
      offerId,
      serviceId: offer.serviceId,
      baselineAmount: baselineQuote.amount,
      purchaseAmount: purchaseQuote.amount,
      optimizedAmount: optimizedQuote.amount,
      totalWithMarket,
      savingsAmount,
      savingsRate,
    };
  }

  _offer(offerId) {
    const offer = this.offers.get(offerId);
    if (!offer) {
      throw new Error(`unknown offerId: ${offerId}`);
    }
    return offer;
  }

  _round(v) {
    return Math.round(v * 1_000_000) / 1_000_000;
  }
}
