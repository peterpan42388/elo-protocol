import { randomUUID } from "node:crypto";
import { assertBoundedText, assertFiniteNumber, assertToken } from "./inputGuards.js";

export class ACPAdapter {
  constructor(market, engine = market?.engine, options = {}) {
    if (!market || !engine) throw new Error("market and engine are required");
    this.market = market;
    this.engine = engine;
    this.defaultEscrowTtlMs = this._positiveInt(options.defaultEscrowTtlMs, 300_000);
    this.maxIntents = this._positiveInt(options.maxIntents, 5_000);
    this.maxEscrows = this._positiveInt(options.maxEscrows, 5_000);
    this.terminalRetentionMs = this._positiveInt(options.terminalRetentionMs, 3_600_000);
    this.intents = new Map();
    this.escrows = new Map();
  }

  openIntent(params) {
    const offerId = assertToken("offerId", params?.offerId, 128);
    const buyerAgentId = assertToken("buyerAgentId", params?.buyerAgentId, 128);
    const units = this._units(params?.units);
    const maxAmountElo = params?.maxAmountElo;
    const note = assertBoundedText("note", String(params?.note ?? ""), 1000);
    this.engine.ownerOf(buyerAgentId);

    const quote = this.market.quotePurchase({
      offerId,
      consumerAgentId: buyerAgentId,
      units,
    });

    const safeMaxAmount =
      maxAmountElo === undefined || maxAmountElo === null
        ? undefined
        : assertFiniteNumber("maxAmountElo", maxAmountElo, { min: 0 });
    if (Number.isFinite(safeMaxAmount) && quote.billable && quote.amount > Number(safeMaxAmount)) {
      throw new Error("quote amount exceeds maxAmountElo");
    }

    this._cleanup(Date.now());
    if (this.intents.size >= this.maxIntents) {
      throw new Error("acp intent queue is full");
    }

    const offer = this._offer(offerId);
    const intentId = `acp-intent-${randomUUID()}`;
    const intent = {
      schemaVersion: "acp.intent.v1",
      intentId,
      offerId,
      serviceId: offer.serviceId,
      providerAgentId: offer.providerAgentId,
      buyerAgentId,
      units,
      quote,
      status: "proposed",
      note,
      createdAt: Date.now(),
      escrowId: null,
    };
    this.intents.set(intentId, intent);
    return intent;
  }

  acceptIntent(intentId, params = {}) {
    this._cleanup(Date.now());
    const intent = this._intent(intentId);
    if (intent.status !== "proposed") {
      throw new Error("intent is not in proposed status");
    }

    const providerAgentId = assertToken("providerAgentId", params?.providerAgentId ?? intent.providerAgentId, 128);
    if (providerAgentId !== intent.providerAgentId) {
      throw new Error("providerAgentId does not match listing provider");
    }

    const ttlMs = this._ttl(params?.ttlMs);
    const now = Date.now();
    if (this.escrows.size >= this.maxEscrows) {
      throw new Error("acp escrow queue is full");
    }
    const escrowId = `acp-escrow-${randomUUID()}`;
    const escrow = {
      schemaVersion: "acp.escrow.v1",
      escrowId,
      intentId,
      offerId: intent.offerId,
      providerAgentId: intent.providerAgentId,
      buyerAgentId: intent.buyerAgentId,
      units: intent.units,
      amountElo: intent.quote.amount,
      billable: intent.quote.billable,
      state: intent.quote.billable ? "awaiting_fund" : "funded",
      createdAt: now,
      expiresAt: now + ttlMs,
      fundedAt: intent.quote.billable ? null : now,
      executedAt: null,
      trade: null,
    };

    intent.status = "accepted";
    intent.escrowId = escrowId;
    intent.acceptedAt = now;
    this.escrows.set(escrowId, escrow);

    return {
      schemaVersion: "acp.acceptance.v1",
      intent,
      escrow,
    };
  }

  fundEscrow(escrowId, params = {}) {
    const escrow = this._escrow(escrowId);
    if (!escrow.billable) {
      throw new Error("funding not required for non-billable escrow");
    }
    if (escrow.state !== "awaiting_fund") {
      throw new Error("escrow is not awaiting fund");
    }
    if (escrow.expiresAt < Date.now()) {
      escrow.state = "expired";
      throw new Error("escrow expired");
    }

    const buyerAgentId = assertToken("buyerAgentId", params?.buyerAgentId ?? escrow.buyerAgentId, 128);
    if (buyerAgentId !== escrow.buyerAgentId) {
      throw new Error("buyerAgentId does not match escrow buyer");
    }

    const balance = this.engine.balanceOf(buyerAgentId);
    if (balance < escrow.amountElo) {
      throw new Error(`insufficient balance for escrow fund: needs ${escrow.amountElo}, has ${balance}`);
    }

    escrow.state = "funded";
    escrow.fundedAt = Date.now();

    return {
      schemaVersion: "acp.escrow.v1",
      ...escrow,
    };
  }

  executeEscrow(escrowId, params = {}) {
    const escrow = this._escrow(escrowId);
    const intent = this._intent(escrow.intentId);
    const requestId = assertToken("requestId", params?.requestId, 128);
    const usageRef = assertBoundedText("usageRef", String(params?.usageRef ?? "acp_escrow"), 256) || "acp_escrow";
    if (escrow.state === "executed") {
      throw new Error("escrow already executed");
    }
    if (escrow.state !== "funded") {
      throw new Error("escrow must be funded before execution");
    }
    if (escrow.expiresAt < Date.now()) {
      escrow.state = "expired";
      intent.status = "expired";
      throw new Error("escrow expired");
    }

    const trade = this.market.purchase({
      offerId: escrow.offerId,
      consumerAgentId: escrow.buyerAgentId,
      requestId,
      usageRef,
      units: escrow.units,
    });

    if (escrow.billable && trade.amount > escrow.amountElo) {
      throw new Error("trade amount exceeds escrow amount");
    }

    escrow.state = "executed";
    escrow.executedAt = Date.now();
    escrow.trade = trade;
    intent.status = "completed";
    intent.completedAt = escrow.executedAt;

    return {
      schemaVersion: "acp.execution.v1",
      intentId: intent.intentId,
      escrowId: escrow.escrowId,
      state: escrow.state,
      trade,
    };
  }

  getIntent(intentId) {
    this._cleanup(Date.now());
    const intent = this._intent(intentId);
    return {
      schemaVersion: "acp.intent.v1",
      ...intent,
    };
  }

  getEscrow(escrowId) {
    this._cleanup(Date.now());
    const escrow = this._escrow(escrowId);
    if (escrow.state !== "executed" && escrow.state !== "expired" && escrow.expiresAt < Date.now()) {
      escrow.state = "expired";
      const intent = this.intents.get(escrow.intentId);
      if (intent && intent.status !== "completed") intent.status = "expired";
    }
    return {
      schemaVersion: "acp.escrow.v1",
      ...escrow,
    };
  }

  _intent(intentId) {
    const id = assertToken("intentId", intentId, 256);
    const intent = this.intents.get(id);
    if (!intent) throw new Error("unknown intentId");
    return intent;
  }

  _escrow(escrowId) {
    const id = assertToken("escrowId", escrowId, 256);
    const escrow = this.escrows.get(id);
    if (!escrow) throw new Error("unknown escrowId");
    return escrow;
  }

  _offer(offerId) {
    const safeOfferId = assertToken("offerId", offerId, 128);
    const offer = this.market.listOffers().find((x) => x.offerId === safeOfferId);
    if (!offer) {
      throw new Error(`unknown offerId: ${safeOfferId}`);
    }
    return offer;
  }

  _units(v) {
    const n = Number(v ?? 1);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("units must be a positive integer");
    }
    return n;
  }

  _ttl(v) {
    const n = Number(v ?? this.defaultEscrowTtlMs);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("ttlMs must be a positive integer");
    }
    return n;
  }

  _positiveInt(value, fallback) {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) return fallback;
    return n;
  }

  _cleanup(now) {
    for (const [escrowId, escrow] of this.escrows.entries()) {
      const isTerminal = escrow.state === "executed" || escrow.state === "expired";
      if (!isTerminal && escrow.expiresAt <= now) {
        escrow.state = "expired";
        const intent = this.intents.get(escrow.intentId);
        if (intent && intent.status !== "completed") intent.status = "expired";
      }

      const terminalAt = escrow.executedAt ?? escrow.expiresAt;
      if ((escrow.state === "executed" || escrow.state === "expired") && terminalAt + this.terminalRetentionMs <= now) {
        this.escrows.delete(escrowId);
        const intent = this.intents.get(escrow.intentId);
        if (intent && (intent.status === "completed" || intent.status === "expired")) {
          this.intents.delete(intent.intentId);
        }
      }
    }

    for (const [intentId, intent] of this.intents.entries()) {
      const staleProposed = intent.status === "proposed" && intent.createdAt + this.terminalRetentionMs <= now;
      if (staleProposed) {
        this.intents.delete(intentId);
      }
    }
  }
}
