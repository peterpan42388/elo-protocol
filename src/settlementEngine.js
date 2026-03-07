import { assertBoundedText, assertFiniteNumber, assertToken } from "./inputGuards.js";

const DEFAULT_PRICING = {
  computeUnitRate: 0.00002,
  energyKwhRate: 0.03,
  minBaseCost: 0.0001,
};

export class SettlementEngine {
  constructor(pricing = DEFAULT_PRICING) {
    this.pricing = pricing;
    this.agentOwners = new Map();
    this.balances = new Map();
    this.ledger = [];
    this.processedRequestIds = new Set();
  }

  registerAgent(agentId, ownerId) {
    const safeAgentId = assertToken("agentId", agentId, 128);
    const safeOwnerId = assertToken("ownerId", ownerId, 128);
    this.agentOwners.set(safeAgentId, safeOwnerId);
    if (!this.balances.has(safeAgentId)) this.balances.set(safeAgentId, 0);
  }

  ownerOf(agentId) {
    const owner = this.agentOwners.get(agentId);
    if (!owner) throw new Error(`unregistered agent: ${agentId}`);
    return owner;
  }

  isSameOwner(agentA, agentB) {
    return this.ownerOf(agentA) === this.ownerOf(agentB);
  }

  recharge(agentId, amount, source = "manual") {
    const safeAgentId = assertToken("agentId", agentId, 128);
    const safeAmount = assertFiniteNumber("amount", amount, { min: 0.000001 });
    const safeSource = assertBoundedText("source", String(source ?? "manual"), 128) || "manual";
    this._addBalance(safeAgentId, safeAmount);
    this.ledger.push({
      type: "RECHARGE",
      agentId: safeAgentId,
      amount: safeAmount,
      source: safeSource,
      ts: Date.now(),
    });
  }

  withdraw(agentId, amount, target = "manual") {
    const safeAgentId = assertToken("agentId", agentId, 128);
    const safeAmount = assertFiniteNumber("amount", amount, { min: 0.000001 });
    const safeTarget = assertBoundedText("target", String(target ?? "manual"), 128) || "manual";
    this._subBalance(safeAgentId, safeAmount);
    this.ledger.push({
      type: "WITHDRAW",
      agentId: safeAgentId,
      amount: safeAmount,
      target: safeTarget,
      ts: Date.now(),
    });
  }

  quote(params) {
    const {
      providerAgentId,
      consumerAgentId,
      computeUnits = 0,
      energyKwh = 0,
      marketMultiplier = 1,
      reputationFactor = 1,
      outcomeBonus = 0,
    } = params;

    assertToken("providerAgentId", providerAgentId, 128);
    assertToken("consumerAgentId", consumerAgentId, 128);
    const safeComputeUnits = assertFiniteNumber("computeUnits", computeUnits, { min: 0 });
    const safeEnergyKwh = assertFiniteNumber("energyKwh", energyKwh, { min: 0 });
    const safeMarketMultiplier = assertFiniteNumber("marketMultiplier", marketMultiplier, { min: 0.000001 });
    const safeReputationFactor = assertFiniteNumber("reputationFactor", reputationFactor, { min: 0.000001 });
    const safeOutcomeBonus = assertFiniteNumber("outcomeBonus", outcomeBonus);

    if (this.isSameOwner(providerAgentId, consumerAgentId)) {
      return {
        billable: false,
        amount: 0,
        reason: "same_owner_free",
      };
    }

    const baseFromCompute = safeComputeUnits * this.pricing.computeUnitRate;
    const baseFromEnergy = safeEnergyKwh * this.pricing.energyKwhRate;
    const baseCost = Math.max(this.pricing.minBaseCost, baseFromCompute + baseFromEnergy);

    const amount = Math.max(0, baseCost * safeMarketMultiplier * safeReputationFactor + safeOutcomeBonus);

    return {
      billable: true,
      amount: this._round(amount),
      reason: "cross_owner_paid",
      baseCost: this._round(baseCost),
    };
  }

  settle(params) {
    const quote = this.quote(params);
    const {
      providerAgentId,
      consumerAgentId,
      usageRef = "n/a",
      requestId,
    } = params;
    const safeRequestId = assertToken("requestId", requestId, 128);
    const safeUsageRef = assertBoundedText("usageRef", String(usageRef ?? "n/a"), 256) || "n/a";

    if (this.processedRequestIds.has(safeRequestId)) {
      throw new Error(`duplicate requestId: ${safeRequestId}`);
    }

    if (!quote.billable) {
      const event = {
        type: "SETTLEMENT",
        billable: false,
        amount: 0,
        providerAgentId,
        consumerAgentId,
        requestId: safeRequestId,
        usageRef: safeUsageRef,
        ts: Date.now(),
      };
      this.processedRequestIds.add(safeRequestId);
      this.ledger.push(event);
      return event;
    }

    this._subBalance(consumerAgentId, quote.amount);
    this._addBalance(providerAgentId, quote.amount);

    const event = {
      type: "SETTLEMENT",
      billable: true,
      amount: quote.amount,
      providerAgentId,
      consumerAgentId,
      requestId: safeRequestId,
      usageRef: safeUsageRef,
      ts: Date.now(),
    };
    this.processedRequestIds.add(safeRequestId);
    this.ledger.push(event);
    return event;
  }

  balanceOf(agentId) {
    return this._round(this.balances.get(agentId) ?? 0);
  }

  _addBalance(agentId, amount) {
    this.ownerOf(agentId);
    this.balances.set(agentId, (this.balances.get(agentId) ?? 0) + amount);
  }

  _subBalance(agentId, amount) {
    this.ownerOf(agentId);
    const current = this.balances.get(agentId) ?? 0;
    if (current < amount) {
      throw new Error(`insufficient balance: ${agentId} needs ${amount}, has ${current}`);
    }
    this.balances.set(agentId, current - amount);
  }

  _round(v) {
    return Math.round(v * 1_000_000) / 1_000_000;
  }
}
