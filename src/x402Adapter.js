import { randomUUID } from "node:crypto";

export class X402Adapter {
  constructor(market, options = {}) {
    if (!market) throw new Error("market is required");
    this.market = market;
    this.defaultTtlMs = Number(options.defaultTtlMs ?? 120_000);
    this.pendingPayments = new Map();
    this.settledPayments = new Map();
  }

  createChallenge(params) {
    const offerId = String(params?.offerId ?? "");
    const consumerAgentId = String(params?.consumerAgentId ?? "");
    const units = this._units(params?.units);
    const usageRef = String(params?.usageRef ?? "x402");
    const ttlMs = this._ttl(params?.ttlMs);

    if (!offerId || !consumerAgentId) {
      throw new Error("offerId and consumerAgentId are required");
    }

    const quote = this.market.quotePurchase({
      offerId,
      consumerAgentId,
      units,
    });
    const offer = this.market.listOffers().find((x) => x.offerId === offerId);
    if (!offer) {
      throw new Error(`unknown offerId: ${offerId}`);
    }
    const paymentId = `x402-${randomUUID()}`;
    const createdAt = Date.now();
    const expiresAt = createdAt + ttlMs;

    const payment = {
      paymentId,
      offerId,
      serviceId: offer.serviceId,
      providerAgentId: offer.providerAgentId,
      consumerAgentId,
      units,
      usageRef,
      amountElo: quote.amount,
      billable: quote.billable,
      reason: quote.reason,
      currency: "ELO",
      createdAt,
      expiresAt,
    };

    if (!quote.billable) {
      return {
        httpStatus: 200,
        payload: {
          schemaVersion: "x402.challenge.v1",
          code: "x402_not_required",
          requiresPayment: false,
          payment,
          instructions: {
            settlePath: "/market/x402/settle",
            method: "POST",
          },
        },
      };
    }

    this.pendingPayments.set(paymentId, payment);
    return {
      httpStatus: 402,
      payload: {
        schemaVersion: "x402.challenge.v1",
        code: "x402_payment_required",
        requiresPayment: true,
        payment,
        instructions: {
          settlePath: "/market/x402/settle",
          method: "POST",
        },
      },
    };
  }

  settlePayment(params) {
    const paymentId = String(params?.paymentId ?? "");
    const requestId = String(params?.requestId ?? "");

    if (!paymentId || !requestId) {
      throw new Error("paymentId and requestId are required");
    }

    if (this.settledPayments.has(paymentId)) {
      throw new Error("payment already settled");
    }

    const payment = this.pendingPayments.get(paymentId);
    if (!payment) {
      throw new Error("unknown paymentId");
    }
    if (payment.expiresAt < Date.now()) {
      this.pendingPayments.delete(paymentId);
      throw new Error("payment challenge expired");
    }

    const trade = this.market.purchase({
      offerId: payment.offerId,
      consumerAgentId: payment.consumerAgentId,
      requestId,
      usageRef: payment.usageRef,
      units: payment.units,
    });

    if (trade.billable && this._round(trade.amount) !== this._round(payment.amountElo)) {
      throw new Error("payment amount mismatch with settlement result");
    }

    this.pendingPayments.delete(paymentId);
    const receipt = {
      schemaVersion: "x402.settlement.v1",
      paymentId,
      requestId,
      offerId: payment.offerId,
      consumerAgentId: payment.consumerAgentId,
      providerAgentId: payment.providerAgentId,
      amountElo: trade.amount,
      billable: trade.billable,
      settledAt: Date.now(),
      trade,
    };
    this.settledPayments.set(paymentId, receipt);
    return receipt;
  }

  getPayment(paymentId) {
    const id = String(paymentId ?? "");
    if (!id) throw new Error("paymentId is required");
    const settled = this.settledPayments.get(id);
    if (settled) {
      return {
        schemaVersion: "x402.payment-state.v1",
        paymentId: id,
        state: "settled",
        settled: settled,
      };
    }

    const pending = this.pendingPayments.get(id);
    if (!pending) {
      throw new Error("unknown paymentId");
    }

    if (pending.expiresAt < Date.now()) {
      this.pendingPayments.delete(id);
      return {
        schemaVersion: "x402.payment-state.v1",
        paymentId: id,
        state: "expired",
      };
    }

    return {
      schemaVersion: "x402.payment-state.v1",
      paymentId: id,
      state: "pending",
      pending,
    };
  }

  _units(v) {
    const n = Number(v ?? 1);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("units must be a positive integer");
    }
    return n;
  }

  _ttl(v) {
    const n = Number(v ?? this.defaultTtlMs);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("ttlMs must be a positive integer");
    }
    return n;
  }

  _round(v) {
    return Math.round(Number(v) * 1_000_000) / 1_000_000;
  }
}
