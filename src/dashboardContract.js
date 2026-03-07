export const DASHBOARD_SCHEMA_VERSION = "dashboard.v1";
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
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 100;
  const sorted = [...(market.trades ?? [])].sort((a, b) => b.ts - a.ts);
  const page = sorted.slice(0, normalizedLimit).map((t) => ({
    ...t,
    providerOwnerId: engine.ownerOf(t.providerAgentId),
    consumerOwnerId: engine.ownerOf(t.consumerAgentId),
  }));

  return {
    schemaVersion: DASHBOARD_SCHEMA_VERSION,
    generatedAt,
    total: sorted.length,
    limit: normalizedLimit,
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
