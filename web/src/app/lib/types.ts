export type ApiClientSettings = {
  apiBaseUrl: string;
  bearerToken?: string;
  hmacSecret?: string;
};

export type DashboardSummary = {
  schemaVersion: string;
  generatedAt: number;
  kpis: {
    ownerCount: number;
    agentCount: number;
    offerCount: number;
    tradeCount: number;
    billableSettlementCount: number;
    freeSettlementCount: number;
    settlementVolumeElo: number;
    rechargeVolumeElo: number;
    withdrawVolumeElo: number;
  };
};

export type DashboardMarketEfficiency = {
  schemaVersion: string;
  generatedAt: number;
  total: number;
  limit: number;
  aggregates: {
    offerCount: number;
    tradeCount: number;
    billableTradeCount: number;
    volumeElo: number;
    totalSavingsAmount: number;
    avgSavingsRate: number;
    avgOutcomeScore: number;
    avgRating: number;
  };
  items: Array<{
    offerId: string;
    serviceId: string;
    providerAgentId: string;
    providerOwnerId: string;
    tradeCount: number;
    billableTradeCount: number;
    volumeElo: number;
    savingsCount: number;
    totalSavingsAmount: number;
    avgSavingsRate: number;
    rating: number;
    ratingCount: number;
    outcomeScore: number;
    outcomeCount: number;
    lastTradeAt: number;
  }>;
};

export type DashboardOutcomes = {
  schemaVersion: string;
  generatedAt: number;
  total: number;
  limit: number;
  aggregates: {
    avgOutcomeScore: number;
    avgOutcomeBonus: number;
    avgSavingRate: number;
  };
  items: Evaluation[];
};

export type AgentStats = {
  agentId: string;
  ownerId: string;
  balance: number;
  rechargeVolumeElo: number;
  withdrawVolumeElo: number;
  settlementPaidInElo: number;
  settlementEarnedInElo: number;
  settlementPaidCount: number;
  settlementEarnedCount: number;
  settlementFreeCount: number;
};

export type Offer = {
  offerId: string;
  kind: "api" | "skill" | "workflow";
  title: string;
  summary: string;
  tags: string[];
  category: string;
  ownerId: string;
  providerAgentId: string;
  serviceId: string;
  operatorEndpoint: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  computeUnits: number;
  energyKwh: number;
  marketMultiplier: number;
  pricingMode: "free" | "per_call" | "subscription";
  priceElo: number;
  tokenSavingEstimate: number;
  latencyP50Ms: number;
  uptimeSla: number;
  license: string;
  sourceUrl: string;
  status: "active" | "deprecated" | "suspended";
  metadata: Record<string, unknown>;
  createdAt: number;
};

export type SearchRequest = {
  schemaVersion: "query.dsl.v1";
  query: string;
  filters?: {
    kind?: Array<"api" | "skill" | "workflow">;
    categories?: string[];
    pricingMode?: Array<"free" | "per_call" | "subscription">;
    priceMaxElo?: number;
    requireHealthy?: boolean;
  };
  sort?: {
    mode?: "hybrid" | "price" | "rating" | "saving" | "outcome";
    direction?: "asc" | "desc";
  };
  page?: {
    offset?: number;
    limit?: number;
  };
};

export type SearchResult = {
  schemaVersion: string;
  query: string;
  total: number;
  offset: number;
  limit: number;
  sort: {
    mode: "hybrid" | "price" | "rating" | "saving" | "outcome";
    direction: "asc" | "desc";
  };
  items: Array<{
    rank: number;
    offer: Offer;
    score: {
      keywordScore: number;
      semanticScore: number;
      ratingScore: number;
      savingScore: number;
      reliabilityScore: number;
      outcomeScore: number;
      pricePenalty: number;
      hybridScore: number;
    };
  }>;
};

export type QuoteResponse = {
  providerAgentId: string;
  consumerAgentId: string;
  computeUnits: number;
  energyKwh: number;
  marketMultiplier: number;
  reputationFactor: number;
  outcomeBonus: number;
  amount: number;
  billable: boolean;
  offerId: string;
  serviceId: string;
  units: number;
};

export type PurchaseResponse = {
  requestId: string;
  providerAgentId: string;
  consumerAgentId: string;
  ownerProvider: string;
  ownerConsumer: string;
  amount: number;
  billable: boolean;
  tokenFlow: string;
  ts: number;
  offerId: string;
  serviceId: string;
  units: number;
};

export type Review = {
  schemaVersion: string;
  reviewId: string;
  listingId: string;
  providerOwnerId: string;
  reviewerAgentId: string;
  rating: number;
  comment: string;
  tokenSavingObserved: number | null;
  latencyScore: number | null;
  reliabilityScore: number | null;
  usageReceiptRef: string;
  createdAt: number;
};

export type Evaluation = {
  schemaVersion: string;
  evaluationId: string;
  eventType: string;
  listingId: string;
  providerOwnerId: string;
  evaluatorAgentId: string;
  usageReceiptRef: string;
  notes: string;
  outcomeScore: number;
  outcomeBonus: number;
  savingRate: number;
  createdAt: number;
};

export type RatingSummary = {
  avg: number;
  count: number;
};

export type OutcomeSummary = {
  count: number;
  avgOutcomeScore: number;
  avgOutcomeBonus: number;
  avgSavingRate: number;
};
