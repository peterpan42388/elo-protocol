import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { formatElo, formatPercent, formatTs, toShortId } from "../lib/format";
import { makeRequestId } from "../lib/ids";
import type { Offer, OutcomeSummary, PurchaseResponse, QuoteResponse, RatingSummary, SearchResult } from "../lib/types";
import { useApiClient } from "../state/api";
import { useAuth } from "../state/auth";

type SortMode = "hybrid" | "price" | "rating" | "saving" | "outcome";
type SortDirection = "asc" | "desc";

const SORT_OPTIONS: Array<{ value: `${SortMode}:${SortDirection}`; label: string }> = [
  { value: "hybrid:desc", label: "Relevance" },
  { value: "rating:desc", label: "Rating" },
  { value: "saving:desc", label: "Savings" },
  { value: "price:asc", label: "Price" },
  { value: "outcome:desc", label: "Outcome" },
];

export function MarketPage() {
  const api = useApiClient();
  const { auth } = useAuth();

  const [query, setQuery] = useState("workflow");
  const [kind, setKind] = useState<"" | "api" | "skill" | "workflow">("");
  const [category, setCategory] = useState("");
  const [pricingMode, setPricingMode] = useState<"" | "free" | "per_call" | "subscription">("free");
  const [requireHealthy, setRequireHealthy] = useState(true);
  const [sortValue, setSortValue] = useState<`${SortMode}:${SortDirection}`>("hybrid:desc");

  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Offer | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [listingRating, setListingRating] = useState<RatingSummary | null>(null);
  const [listingOutcome, setListingOutcome] = useState<OutcomeSummary | null>(null);

  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<1 | 2 | 3>(1);
  const [consumerAgentId, setConsumerAgentId] = useState(auth.defaultConsumerAgentId);
  const [units, setUnits] = useState(1);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResponse | null>(null);
  const [purchaseBusy, setPurchaseBusy] = useState(false);

  const [sortMode, sortDirection] = useMemo(() => {
    const [mode, direction] = sortValue.split(":") as [SortMode, SortDirection];
    return [mode, direction] as const;
  }, [sortValue]);

  const runSearch = useCallback(async () => {
    if (!query.trim()) {
      setSearchError("query is required");
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    try {
      const response = await api.search({
        schemaVersion: "query.dsl.v1",
        query: query.trim(),
        filters: {
          kind: kind ? [kind] : undefined,
          categories: category ? [category] : undefined,
          pricingMode: pricingMode ? [pricingMode] : undefined,
          requireHealthy,
        },
        sort: {
          mode: sortMode,
          direction: sortDirection,
        },
        page: {
          offset: 0,
          limit: 24,
        },
      });
      setResult(response);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "search failed");
    } finally {
      setIsLoading(false);
    }
  }, [api, category, kind, pricingMode, query, requireHealthy, sortDirection, sortMode]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  const openDetail = useCallback(
    async (offer: Offer) => {
      setSelected(offer);
      setDetailLoading(true);
      setDetailError(null);
      setListingRating(null);
      setListingOutcome(null);
      try {
        const [ratingRes, outcomeRes] = await Promise.all([
          api.getListingRating(offer.offerId),
          api.getListingOutcome(offer.offerId),
        ]);
        setListingRating({ avg: ratingRes.avg, count: ratingRes.count });
        setListingOutcome({
          count: outcomeRes.count,
          avgOutcomeScore: outcomeRes.avgOutcomeScore,
          avgOutcomeBonus: outcomeRes.avgOutcomeBonus,
          avgSavingRate: outcomeRes.avgSavingRate,
        });
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : "failed to load listing detail");
      } finally {
        setDetailLoading(false);
      }
    },
    [api]
  );

  function resetPurchaseFlow() {
    setPurchaseStep(1);
    setPurchaseError(null);
    setQuote(null);
    setBalance(null);
    setPurchaseResult(null);
    setUnits(1);
    setConsumerAgentId(auth.defaultConsumerAgentId);
  }

  async function handleGetQuote() {
    if (!selected) return;
    if (!consumerAgentId.trim()) {
      setPurchaseError("consumerAgentId is required");
      return;
    }

    setPurchaseBusy(true);
    setPurchaseError(null);
    try {
      const quoteRes = await api.quotePurchase({
        offerId: selected.offerId,
        consumerAgentId: consumerAgentId.trim(),
        units,
      });
      const balanceRes = await api.getBalance(consumerAgentId.trim());
      setQuote(quoteRes);
      setBalance(balanceRes.balance);
      setPurchaseStep(2);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "failed to quote");
    } finally {
      setPurchaseBusy(false);
    }
  }

  async function handlePurchase() {
    if (!selected || !quote) return;

    setPurchaseBusy(true);
    setPurchaseError(null);
    try {
      const response = await api.purchase({
        offerId: selected.offerId,
        consumerAgentId: consumerAgentId.trim(),
        requestId: makeRequestId("market"),
        usageRef: `market:${selected.offerId}`,
        units,
      });
      setPurchaseResult(response);
      setPurchaseStep(3);
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "failed to purchase");
    } finally {
      setPurchaseBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Market Search"
        description="Discover APIs, skills, and workflows with structured filters and relevance sorting."
      />

      <section className="panel">
        <div className="search-row">
          <input
            className="input"
            placeholder="Search skills, APIs, workflows..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="button button-primary" type="button" onClick={() => void runSearch()} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="market-filters">
          <select className="select" value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}>
            <option value="">Type: All</option>
            <option value="workflow">Workflow</option>
            <option value="skill">Skill</option>
            <option value="api">API</option>
          </select>

          <input
            className="input"
            placeholder="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />

          <select
            className="select"
            value={pricingMode}
            onChange={(event) => setPricingMode(event.target.value as typeof pricingMode)}
          >
            <option value="">Pricing: All</option>
            <option value="free">Free</option>
            <option value="per_call">Per Call</option>
            <option value="subscription">Subscription</option>
          </select>

          <select className="select" value={sortValue} onChange={(event) => setSortValue(event.target.value as typeof sortValue)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={requireHealthy}
              onChange={(event) => setRequireHealthy(event.target.checked)}
            />
            Healthy only
          </label>
        </div>

        {searchError ? <p className="status-error">{searchError}</p> : null}
      </section>

      <section className="listing-grid">
        {result?.items?.length ? (
          result.items.map((item) => (
            <article key={item.offer.offerId} className="listing-card" onClick={() => void openDetail(item.offer)}>
              <div className="listing-head">
                <h2>{item.offer.title}</h2>
                <span className="chip">{item.offer.kind}</span>
              </div>
              <p className="listing-summary">{item.offer.summary || "No summary"}</p>
              <div className="listing-meta">
                <span>{item.offer.category}</span>
                <span>{formatElo(item.offer.priceElo)}</span>
                <span>{formatPercent(item.offer.tokenSavingEstimate)}</span>
              </div>
              <div className="listing-score">
                <span>Rank #{item.rank}</span>
                <span>Score {item.score.hybridScore.toFixed(3)}</span>
              </div>
            </article>
          ))
        ) : (
          <article className="panel">
            <p className="panel-subtitle">No listing matched your query.</p>
          </article>
        )}
      </section>

      {selected ? (
        <aside className="drawer" aria-label="listing detail">
          <div className="drawer-head">
            <div>
              <h2>{selected.title}</h2>
              <p className="panel-subtitle">{selected.offerId}</p>
            </div>
            <button className="button button-ghost" type="button" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>

          {detailError ? <p className="status-error">{detailError}</p> : null}

          <div className="drawer-meta">
            <span className="chip">{selected.kind}</span>
            <span className="chip">{selected.category}</span>
            <span className="chip">{selected.pricingMode}</span>
            <span className="chip">{formatElo(selected.priceElo)}</span>
          </div>

          <p>{selected.summary || "No summary"}</p>

          <div className="detail-grid">
            <div className="panel">
              <h3>Listing Rating</h3>
              <p>{detailLoading ? "Loading..." : `${listingRating?.avg.toFixed(2) ?? "0.00"} (${listingRating?.count ?? 0})`}</p>
            </div>
            <div className="panel">
              <h3>Outcome Score</h3>
              <p>{detailLoading ? "Loading..." : `${listingOutcome?.avgOutcomeScore.toFixed(2) ?? "0.00"}`}</p>
            </div>
            <div className="panel">
              <h3>Savings</h3>
              <p>{detailLoading ? "Loading..." : formatPercent(listingOutcome?.avgSavingRate ?? selected.tokenSavingEstimate)}</p>
            </div>
          </div>

          <div className="drawer-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => {
                resetPurchaseFlow();
                setIsPurchaseOpen(true);
              }}
            >
              Get Quote
            </button>
            <button className="button button-secondary" type="button" onClick={() => window.alert("Use Reviews page for full review flow") }>
              View Reviews
            </button>
          </div>
        </aside>
      ) : null}

      {isPurchaseOpen && selected ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="purchase flow">
          <div className="modal-card">
            <header className="modal-header">
              <h2>Purchase Flow · {selected.title}</h2>
              <button className="button button-ghost" type="button" onClick={() => setIsPurchaseOpen(false)}>
                Close
              </button>
            </header>

            <div className="modal-steps">
              <span className={purchaseStep === 1 ? "step-active" : "step"}>1. Quote</span>
              <span className={purchaseStep === 2 ? "step-active" : "step"}>2. Confirm</span>
              <span className={purchaseStep === 3 ? "step-active" : "step"}>3. Done</span>
            </div>

            {purchaseStep === 1 ? (
              <div className="modal-body">
                <label className="label">
                  Consumer Agent ID
                  <input
                    className="input code"
                    value={consumerAgentId}
                    onChange={(event) => setConsumerAgentId(event.target.value)}
                    placeholder="agentConsumer"
                  />
                </label>
                <label className="label">
                  Units
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={units}
                    onChange={(event) => setUnits(Math.max(1, Number(event.target.value || 1)))}
                  />
                </label>
              </div>
            ) : null}

            {purchaseStep === 2 ? (
              <div className="modal-body">
                <p className="summary-line">
                  Quote Amount: <strong>{formatElo(quote?.amount ?? 0)}</strong>
                </p>
                <p className="summary-line">
                  Consumer Balance: <strong>{formatElo(balance ?? 0)}</strong>
                </p>
                <p className="summary-line">
                  Billing Mode: <strong>{quote?.billable ? "cross_owner_paid" : "same_owner_free"}</strong>
                </p>
              </div>
            ) : null}

            {purchaseStep === 3 ? (
              <div className="modal-body">
                <p className="summary-line">
                  Purchase complete: <strong>{purchaseResult?.tokenFlow}</strong>
                </p>
                <p className="summary-line">
                  Request ID: <span className="code">{purchaseResult?.requestId}</span>
                </p>
                <p className="summary-line">Settlement: {formatTs(purchaseResult?.ts ?? 0)}</p>
              </div>
            ) : null}

            {purchaseError ? <p className="status-error">{purchaseError}</p> : null}

            <footer className="modal-footer">
              {purchaseStep > 1 && purchaseStep < 3 ? (
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() => setPurchaseStep((prev) => (prev === 2 ? 1 : prev))}
                  disabled={purchaseBusy}
                >
                  Back
                </button>
              ) : (
                <span />
              )}

              {purchaseStep === 1 ? (
                <button className="button button-primary" type="button" onClick={() => void handleGetQuote()} disabled={purchaseBusy}>
                  {purchaseBusy ? "Quoting..." : "Get Quote"}
                </button>
              ) : null}

              {purchaseStep === 2 ? (
                <button className="button button-primary" type="button" onClick={() => void handlePurchase()} disabled={purchaseBusy}>
                  {purchaseBusy ? "Purchasing..." : "Confirm Purchase"}
                </button>
              ) : null}

              {purchaseStep === 3 ? (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => {
                    setIsPurchaseOpen(false);
                    void runSearch();
                  }}
                >
                  Done
                </button>
              ) : null}
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
