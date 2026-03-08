import { hmacSha256Hex } from "./hmac";
import type {
  AgentStats,
  ApiClientSettings,
  DashboardMarketEfficiency,
  DashboardOutcomes,
  DashboardSummary,
  Evaluation,
  Offer,
  OutcomeSummary,
  PurchaseResponse,
  QuoteResponse,
  RatingSummary,
  Review,
  SearchRequest,
  SearchResult,
} from "./types";

type ApiErrorPayload = {
  error?: string;
  retryAfterMs?: number;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function withLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function joinUrl(base: string, path: string): string {
  return `${trimTrailingSlash(base)}${withLeadingSlash(path)}`;
}

function parseJsonSafe(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export class EloApiClient {
  private settings: ApiClientSettings;

  constructor(settings: ApiClientSettings) {
    this.settings = settings;
  }

  setSettings(settings: ApiClientSettings) {
    this.settings = settings;
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.get("/dashboard/summary");
  }

  async getDashboardAgents(): Promise<{ schemaVersion: string; generatedAt: number; items: AgentStats[] }> {
    return this.get("/dashboard/agents");
  }

  async getDashboardMarketEfficiency(limit = 20): Promise<DashboardMarketEfficiency> {
    return this.get(`/dashboard/market-efficiency?limit=${encodeURIComponent(String(limit))}`);
  }

  async getDashboardOutcomes(limit = 100): Promise<DashboardOutcomes> {
    return this.get(`/dashboard/outcomes?limit=${encodeURIComponent(String(limit))}`);
  }

  async search(body: SearchRequest): Promise<SearchResult> {
    return this.post("/market/search", body);
  }

  async listOffers(): Promise<{ offers: Offer[] }> {
    return this.get("/market/offers");
  }

  async quotePurchase(body: {
    offerId: string;
    consumerAgentId: string;
    units?: number;
    reputationFactor?: number;
    outcomeBonus?: number;
    marketMultiplier?: number;
  }): Promise<QuoteResponse> {
    return this.post("/market/quote", body);
  }

  async purchase(body: {
    offerId: string;
    consumerAgentId: string;
    requestId: string;
    usageRef?: string;
    units?: number;
    reputationFactor?: number;
    outcomeBonus?: number;
    marketMultiplier?: number;
  }): Promise<PurchaseResponse> {
    return this.post("/market/purchase", body);
  }

  async getListingRating(listingId: string): Promise<{ listingId: string } & RatingSummary> {
    return this.get(`/market/ratings/listing/${encodeURIComponent(listingId)}`);
  }

  async getListingOutcome(listingId: string): Promise<{ listingId: string } & OutcomeSummary> {
    return this.get(`/market/outcomes/listing/${encodeURIComponent(listingId)}`);
  }

  async listReviews(filters: { listingId?: string; providerOwnerId?: string }): Promise<{ reviews: Review[] }> {
    const search = new URLSearchParams();
    if (filters.listingId) search.set("listingId", filters.listingId);
    if (filters.providerOwnerId) search.set("providerOwnerId", filters.providerOwnerId);
    const query = search.toString();
    return this.get(`/market/reviews${query ? `?${query}` : ""}`);
  }

  async listEvaluations(filters: { listingId?: string; providerOwnerId?: string }): Promise<{ evaluations: Evaluation[] }> {
    const search = new URLSearchParams();
    if (filters.listingId) search.set("listingId", filters.listingId);
    if (filters.providerOwnerId) search.set("providerOwnerId", filters.providerOwnerId);
    const query = search.toString();
    return this.get(`/market/evaluations${query ? `?${query}` : ""}`);
  }

  async submitReview(body: {
    listingId: string;
    reviewerAgentId: string;
    rating: number;
    usageReceiptRef: string;
    tokenSavingObserved?: number;
    comment?: string;
    latencyScore?: number;
    reliabilityScore?: number;
  }): Promise<Review> {
    return this.post("/market/reviews/submit", body);
  }

  async submitEvaluation(body: {
    listingId: string;
    evaluatorAgentId: string;
    usageReceiptRef: string;
    baselineAmount: number;
    actualAmount: number;
    tokenSavingObserved?: number;
    latencyScore?: number;
    reliabilityScore?: number;
    notes?: string;
  }): Promise<Evaluation> {
    return this.post("/market/evaluations/submit", body);
  }

  async registerAgent(agentId: string, ownerId: string): Promise<{ ok: boolean }> {
    return this.post("/register-agent", { agentId, ownerId });
  }

  async recharge(agentId: string, amount: number): Promise<{ ok: boolean; balance: number }> {
    return this.post("/recharge", { agentId, amount });
  }

  async getBalance(agentId: string): Promise<{ agentId: string; balance: number }> {
    return this.get(`/balance/${encodeURIComponent(agentId)}`);
  }

  private async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  private async request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    const endpoint = withLeadingSlash(path);
    const url = joinUrl(this.settings.apiBaseUrl, endpoint);
    const headers: Record<string, string> = {};

    if (this.settings.bearerToken) {
      headers.Authorization = `Bearer ${this.settings.bearerToken}`;
    }

    if (method === "POST") {
      headers["Content-Type"] = "application/json";
      if (this.settings.hmacSecret) {
        const ts = String(Date.now());
        const canonical = `${method}\n${endpoint.split("?")[0]}\n${ts}`;
        const digest = await hmacSha256Hex(this.settings.hmacSecret, canonical);
        headers["X-ELO-Timestamp"] = ts;
        headers["X-ELO-Signature"] = `sha256=${digest}`;
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
    });

    const text = await response.text();
    const payload = parseJsonSafe(text);

    if (!response.ok) {
      const apiPayload = (payload && typeof payload === "object") ? (payload as ApiErrorPayload) : undefined;
      const message = apiPayload?.error || `request failed with status ${response.status}`;
      throw new ApiError(response.status, message, apiPayload);
    }

    return payload as T;
  }
}
