export const DASHBOARD_SCHEMA_VERSION = "dashboard.v1";
export const DASHBOARD_MARKET_SCHEMA_VERSION = "dashboard.market.v1";
export const DASHBOARD_OUTCOMES_SCHEMA_VERSION = "dashboard.outcomes.v1";
const DASHBOARD_OFFER_FIELDS_V1 = [
  "offerId",
  "providerAgentId",
  "serviceId",
  "computeUnits",
  "energyKwh",
  "marketMultiplier",
  "createdAt",
  "metadata",
];

function round(v) {
  return Math.round(v * 1_000_000) / 1_000_000;
}

function sum(items, selector) {
  return round(items.reduce((acc, item) => acc + selector(item), 0));
}

function asArray(mapLike) {
  if (!mapLike) return [];
  return [...mapLike.entries()];
}

function nowTs() {
  return Date.now();
}

function normalizedLimit(limit, fallback = 100, max = 500) {
  const n = Number(limit);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(max, Math.floor(n));
}

export function buildDashboardSummary(engine, market) {
  const generatedAt = nowTs();
  const agents = asArray(engine.agentOwners).map(([agentId, ownerId]) => ({
    agentId,
    ownerId,
    balance: engine.balanceOf(agentId),
  }));
  const ledger = engine.ledger ?? [];
  const trades = market.trades ?? [];

  const ownerCount = new Set(agents.map((a) => a.ownerId)).size;
  const settlements = ledger.filter((x) => x.type === "SETTLEMENT");
  const billableSettlements = settlements.filter((x) => x.billable);
  const freeSettlements = settlements.filter((x) => !x.billable);

  const rechargeEntries = ledger.filter((x) => x.type === "RECHARGE");
  const withdrawEntries = ledger.filter((x) => x.type === "WITHDRAW");

  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    generatedAt,
    kpis: {
      ownerCount,
      agentCount: agents.length,
      offerCount: market.offers.size,
      tradeCount: trades.length,
      billableSettlementCount: billableSettlements.length,
      freeSettlementCount: freeSettlements.length,
      settlementVolumeElo: sum(billableSettlements, (x) => x.amount),
      rechargeVolumeElo: sum(rechargeEntries, (x) => x.amount),
      withdrawVolumeElo: sum(withdrawEntries, (x) => x.amount),
    },
  };
}

export function buildDashboardAgents(engine) {
  const generatedAt = nowTs();
  const ledger = engine.ledger ?? [];

  const metrics = new Map();
  const ensure = (agentId) => {
    if (!metrics.has(agentId)) {
      metrics.set(agentId, {
        rechargeVolumeElo: 0,
        withdrawVolumeElo: 0,
        settlementPaidInElo: 0,
        settlementEarnedInElo: 0,
        settlementPaidCount: 0,
        settlementEarnedCount: 0,
        settlementFreeCount: 0,
      });
    }
    return metrics.get(agentId);
  };

  for (const e of ledger) {
    if (e.type === "RECHARGE") {
      ensure(e.agentId).rechargeVolumeElo += e.amount;
      continue;
    }
    if (e.type === "WITHDRAW") {
      ensure(e.agentId).withdrawVolumeElo += e.amount;
      continue;
    }
    if (e.type === "SETTLEMENT") {
      if (e.billable) {
        const c = ensure(e.consumerAgentId);
        const p = ensure(e.providerAgentId);
        c.settlementPaidInElo += e.amount;
        c.settlementPaidCount += 1;
        p.settlementEarnedInElo += e.amount;
        p.settlementEarnedCount += 1;
      } else {
        ensure(e.consumerAgentId).settlementFreeCount += 1;
      }
    }
  }

  const items = asArray(engine.agentOwners)
    .map(([agentId, ownerId]) => {
      const m = ensure(agentId);
      return {
        agentId,
        ownerId,
        balance: engine.balanceOf(agentId),
        rechargeVolumeElo: round(m.rechargeVolumeElo),
        withdrawVolumeElo: round(m.withdrawVolumeElo),
        settlementPaidInElo: round(m.settlementPaidInElo),
        settlementEarnedInElo: round(m.settlementEarnedInElo),
        settlementPaidCount: m.settlementPaidCount,
        settlementEarnedCount: m.settlementEarnedCount,
        settlementFreeCount: m.settlementFreeCount,
      };
    })
    .sort((a, b) => a.agentId.localeCompare(b.agentId));

  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    generatedAt,
    items,
  };
}

export function buildDashboardOffers(engine, market) {
  const generatedAt = nowTs();
  const items = market.listOffers().map((offer) => {
    const projected = {};
    for (const key of DASHBOARD_OFFER_FIELDS_V1) projected[key] = offer[key];
    return {
      ...projected,
      providerOwnerId: engine.ownerOf(offer.providerAgentId),
    };
  });
  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    generatedAt,
    items,
  };
}

export function buildDashboardTrades(engine, market, limit = 100) {
  const generatedAt = nowTs();
  const safeLimit = normalizedLimit(limit, 100, 500);
  const sorted = [...(market.trades ?? [])].sort((a, b) => b.ts - a.ts);
  const page = sorted.slice(0, safeLimit).map((t) => ({
    ...t,
    providerOwnerId: engine.ownerOf(t.providerAgentId),
    consumerOwnerId: engine.ownerOf(t.consumerAgentId),
  }));

  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    generatedAt,
    total: sorted.length,
    limit: safeLimit,
    aggregates: {
      billableCount: sorted.filter((x) => x.billable).length,
      freeCount: sorted.filter((x) => !x.billable).length,
      volumeElo: sum(sorted.filter((x) => x.billable), (x) => x.amount),
    },
    items: page,
  };
}

export function buildDashboardSavings(market) {
  const generatedAt = nowTs();
  const items = [...(market.savingsReports ?? [])].sort((a, b) => b.ts - a.ts);
  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    generatedAt,
    total: items.length,
    aggregates: {
      totalSavingsAmount: sum(items, (x) => x.savingsAmount),
      avgSavingsRate: items.length ? round(sum(items, (x) => x.savingsRate) / items.length) : 0,
      maxSavingsRate: items.length ? Math.max(...items.map((x) => x.savingsRate)) : 0,
    },
    items,
  };
}

export function buildDashboardSchemaDescriptor() {
  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    docsPath: "docs/DASHBOARD_API_CONTRACT.v1.zh-en.md",
    endpoints: [
      "/dashboard/summary",
      "/dashboard/agents",
      "/dashboard/offers",
      "/dashboard/trades?limit=100",
      "/dashboard/savings",
      "/dashboard/schema",
    ],
  };
}

export function buildDashboardMarketEfficiency(engine, market, limit = 20) {
  const generatedAt = nowTs();
  const safeLimit = normalizedLimit(limit, 20, 200);
  const trades = [...(market.trades ?? [])];
  const savings = [...(market.savingsReports ?? [])];
  const offers = market.listOffers();

  const byOffer = new Map();
  const ensure = (offerId) => {
    if (!byOffer.has(offerId)) {
      const offer = offers.find((x) => x.offerId === offerId);
      byOffer.set(offerId, {
        offerId,
        serviceId: offer?.serviceId ?? "unknown",
        providerAgentId: offer?.providerAgentId ?? "unknown",
        providerOwnerId: offer ? engine.ownerOf(offer.providerAgentId) : "unknown",
        tradeCount: 0,
        billableTradeCount: 0,
        volumeElo: 0,
        savingsCount: 0,
        totalSavingsAmount: 0,
        avgSavingsRate: 0,
        rating: market.getListingRating(offerId).avg,
        ratingCount: market.getListingRating(offerId).count,
        outcomeScore: market.getListingOutcome(offerId).avgOutcomeScore,
        outcomeCount: market.getListingOutcome(offerId).count,
        lastTradeAt: 0,
      });
    }
    return byOffer.get(offerId);
  };

  for (const t of trades) {
    const row = ensure(t.offerId);
    row.tradeCount += 1;
    if (t.billable) row.billableTradeCount += 1;
    row.volumeElo += t.billable ? t.amount : 0;
    row.lastTradeAt = Math.max(row.lastTradeAt, t.ts ?? 0);
  }

  for (const s of savings) {
    const row = ensure(s.offerId);
    row.savingsCount += 1;
    row.totalSavingsAmount += s.savingsAmount ?? 0;
    row.avgSavingsRate += s.savingsRate ?? 0;
  }

  const rows = [...byOffer.values()].map((row) => {
    const avgSavingsRate = row.savingsCount > 0 ? row.avgSavingsRate / row.savingsCount : 0;
    return {
      ...row,
      volumeElo: round(row.volumeElo),
      totalSavingsAmount: round(row.totalSavingsAmount),
      avgSavingsRate: round(avgSavingsRate),
    };
  });

  const maxVolume = Math.max(1, ...rows.map((x) => x.volumeElo));
  const ranked = rows.map((row) => {
    const volumeScore = row.volumeElo / maxVolume;
    const ratingScore = row.rating > 0 ? row.rating / 5 : 0;
    const efficiencyScore = round(
      0.4 * row.avgSavingsRate +
      0.25 * row.outcomeScore +
      0.2 * ratingScore +
      0.15 * volumeScore
    );
    return { ...row, efficiencyScore };
  });

  ranked.sort((a, b) => {
    if (b.efficiencyScore !== a.efficiencyScore) return b.efficiencyScore - a.efficiencyScore;
    if (b.volumeElo !== a.volumeElo) return b.volumeElo - a.volumeElo;
    return b.lastTradeAt - a.lastTradeAt;
  });

  const page = ranked.slice(0, safeLimit);
  const totalSavingsAmount = sum(rows, (x) => x.totalSavingsAmount);
  const avgSavingsRate = rows.length ? round(sum(rows, (x) => x.avgSavingsRate) / rows.length) : 0;
  const avgOutcomeScore = rows.length ? round(sum(rows, (x) => x.outcomeScore) / rows.length) : 0;
  const avgRating = rows.length ? round(sum(rows, (x) => x.rating) / rows.length) : 0;

  return {
    schemaVersion: DASHBOARD_MARKET_SCHEMA_VERSION,
    generatedAt,
    total: ranked.length,
    limit: safeLimit,
    aggregates: {
      offerCount: ranked.length,
      tradeCount: trades.length,
      billableTradeCount: trades.filter((x) => x.billable).length,
      volumeElo: sum(trades.filter((x) => x.billable), (x) => x.amount),
      totalSavingsAmount,
      avgSavingsRate,
      avgOutcomeScore,
      avgRating,
    },
    items: page,
  };
}

export function buildDashboardOutcomes(market, limit = 100) {
  const generatedAt = nowTs();
  const safeLimit = normalizedLimit(limit, 100, 1000);
  const evaluations = market.listEvaluations ? market.listEvaluations({}) : [];
  const page = evaluations.slice(0, safeLimit);

  const count = evaluations.length;
  const avgOutcomeScore = count ? round(sum(evaluations, (x) => x.outcomeScore ?? 0) / count) : 0;
  const avgOutcomeBonus = count ? round(sum(evaluations, (x) => x.outcomeBonus ?? 0) / count) : 0;
  const avgSavingRate = count ? round(sum(evaluations, (x) => x.savingRate ?? 0) / count) : 0;

  return {
    schemaVersion: DASHBOARD_OUTCOMES_SCHEMA_VERSION,
    generatedAt,
    total: count,
    limit: safeLimit,
    aggregates: {
      avgOutcomeScore,
      avgOutcomeBonus,
      avgSavingRate,
    },
    items: page,
  };
}
