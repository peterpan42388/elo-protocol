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
    if (!agentId || !ownerId) throw new Error("agentId and ownerId are required");
    this.agentOwners.set(agentId, ownerId);
    if (!this.balances.has(agentId)) this.balances.set(agentId, 0);
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
    if (amount <= 0) throw new Error("recharge amount must be > 0");
    this._addBalance(agentId, amount);
    this.ledger.push({
      type: "RECHARGE",
      agentId,
      amount,
      source,
      ts: Date.now(),
    });
  }

  withdraw(agentId, amount, target = "manual") {
    if (amount <= 0) throw new Error("withdraw amount must be > 0");
    this._subBalance(agentId, amount);
    this.ledger.push({
      type: "WITHDRAW",
      agentId,
      amount,
      target,
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

    if (this.isSameOwner(providerAgentId, consumerAgentId)) {
      return {
        billable: false,
        amount: 0,
        reason: "same_owner_free",
      };
    }

    if (marketMultiplier <= 0 || reputationFactor <= 0) {
      throw new Error("marketMultiplier and reputationFactor must be > 0");
    }

    const baseFromCompute = computeUnits * this.pricing.computeUnitRate;
    const baseFromEnergy = energyKwh * this.pricing.energyKwhRate;
    const baseCost = Math.max(this.pricing.minBaseCost, baseFromCompute + baseFromEnergy);

    const amount = Math.max(0, baseCost * marketMultiplier * reputationFactor + outcomeBonus);

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

    if (!requestId || typeof requestId !== "string") {
      throw new Error("requestId is required");
    }
    if (this.processedRequestIds.has(requestId)) {
      throw new Error(`duplicate requestId: ${requestId}`);
    }

    if (!quote.billable) {
      const event = {
        type: "SETTLEMENT",
        billable: false,
        amount: 0,
        providerAgentId,
        consumerAgentId,
        requestId,
        usageRef,
        ts: Date.now(),
      };
      this.processedRequestIds.add(requestId);
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
      requestId,
      usageRef,
      ts: Date.now(),
    };
    this.processedRequestIds.add(requestId);
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
