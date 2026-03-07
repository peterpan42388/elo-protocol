import { SettlementEngine } from "./settlementEngine.js";
import { DefaultOutcomeEvaluator } from "./outcomeEvaluator.js";
import { assertBoundedText, assertToken } from "./inputGuards.js";

export class ELOMarket {
  constructor(engine = new SettlementEngine(), outcomeEvaluator = new DefaultOutcomeEvaluator()) {
    this.engine = engine;
    this.outcomeEvaluator = outcomeEvaluator;
    this.offers = new Map();
    this.trades = [];
    this.savingsReports = [];
    this.reviews = [];
    this.reviewReceiptIndex = new Set();
    this.evaluations = [];
    this.evaluationReceiptIndex = new Set();
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
      kind,
      title,
      summary,
      tags,
      category,
      pricingMode,
      priceElo,
      tokenSavingEstimate,
      latencyP50Ms,
      uptimeSla,
      license,
      sourceUrl,
      operatorEndpoint,
      inputSchema,
      outputSchema,
      status,
    } = params;

    const safeOfferId = assertToken("offerId", offerId, 128);
    const safeProviderAgentId = assertToken("providerAgentId", providerAgentId, 128);
    const safeServiceId = assertToken("serviceId", serviceId, 256);
    if (this.offers.has(safeOfferId)) {
      throw new Error(`duplicate offerId: ${safeOfferId}`);
    }

    const ownerId = this.engine.ownerOf(safeProviderAgentId);

    if (!Number.isFinite(computeUnits) || computeUnits < 0) {
      throw new Error("computeUnits must be >= 0");
    }
    if (!Number.isFinite(energyKwh) || energyKwh < 0) {
      throw new Error("energyKwh must be >= 0");
    }
    if (!Number.isFinite(marketMultiplier) || marketMultiplier <= 0) {
      throw new Error("marketMultiplier must be > 0");
    }

    const resolvedPricingMode = pricingMode ?? (priceElo === 0 ? "free" : "per_call");
    if (!["free", "per_call", "subscription"].includes(resolvedPricingMode)) {
      throw new Error("pricingMode must be free/per_call/subscription");
    }

    const estimatedPrice = this._estimateListingPrice(computeUnits, energyKwh, marketMultiplier);
    const resolvedPrice = Number.isFinite(priceElo) ? Number(priceElo) : estimatedPrice;
    if (resolvedPrice < 0) {
      throw new Error("priceElo must be >= 0");
    }

    if (resolvedPricingMode === "free" && resolvedPrice !== 0) {
      throw new Error("free listing must have priceElo = 0");
    }

    const resolvedKind = kind ?? "workflow";
    if (!["api", "skill", "workflow"].includes(resolvedKind)) {
      throw new Error("kind must be api/skill/workflow");
    }

    const resolvedStatus = status ?? "active";
    if (!["active", "deprecated", "suspended"].includes(resolvedStatus)) {
      throw new Error("status must be active/deprecated/suspended");
    }

    const offer = {
      offerId: safeOfferId,
      kind: resolvedKind,
      title: assertBoundedText("title", String(title ?? safeServiceId), 128) || safeServiceId,
      summary: assertBoundedText("summary", String(summary ?? metadata.summary ?? ""), 1000),
      tags: Array.isArray(tags) ? tags : (Array.isArray(metadata.tags) ? metadata.tags : []),
      category: category ?? metadata.category ?? "general",
      ownerId,
      providerAgentId: safeProviderAgentId,
      serviceId: safeServiceId,
      operatorEndpoint: operatorEndpoint ?? metadata.operatorEndpoint ?? "local",
      inputSchema: inputSchema ?? metadata.inputSchema ?? {},
      outputSchema: outputSchema ?? metadata.outputSchema ?? {},
      computeUnits,
      energyKwh,
      marketMultiplier,
      pricingMode: resolvedPricingMode,
      priceElo: this._round(resolvedPrice),
      tokenSavingEstimate: this._normalizeRate(tokenSavingEstimate ?? metadata.tokenSavingEstimate ?? 0),
      latencyP50Ms: this._normalizeNonNegative(latencyP50Ms ?? metadata.latencyP50Ms ?? 0),
      uptimeSla: this._normalizeRate(uptimeSla ?? metadata.uptimeSla ?? 1),
      license: license ?? metadata.license ?? "unknown",
      sourceUrl: sourceUrl ?? metadata.sourceUrl ?? "",
      status: resolvedStatus,
      metadata,
      createdAt: Date.now(),
    };

    this.offers.set(safeOfferId, offer);
    return offer;
  }

  listOffers() {
    return [...this.offers.values()].sort((a, b) => a.createdAt - b.createdAt);
  }

  searchListings(dsl) {
    const query = String(dsl?.query ?? "").trim();
    if (!query) {
      throw new Error("query is required");
    }

    const filters = dsl?.filters ?? {};
    const sort = dsl?.sort ?? {};
    const page = dsl?.page ?? {};

    const mode = sort.mode ?? "hybrid";
    const direction = sort.direction ?? (mode === "price" ? "asc" : "desc");
    if (!["hybrid", "price", "rating", "saving", "outcome"].includes(mode)) {
      throw new Error("sort.mode must be hybrid/price/rating/saving/outcome");
    }
    if (!["asc", "desc"].includes(direction)) {
      throw new Error("sort.direction must be asc/desc");
    }

    const offset = this._asOffset(page.offset);
    const limit = this._asLimit(page.limit);

    const filtered = this.listOffers().filter((offer) => this._matchFilters(offer, filters));
    const maxPrice = Math.max(1, ...filtered.map((x) => x.priceElo));

    const scored = filtered.map((offer) => {
      const keywordScore = this._keywordScore(query, offer);
      const semanticScore = this._semanticScore(query, offer);
      const listingRating = this.getListingRating(offer.offerId).avg;
      const providerRating = this.getProviderRating(offer.ownerId).avg;
      const ratingScore = this._round((listingRating + providerRating) / 10);
      const savingScore = offer.tokenSavingEstimate;
      const reliabilityScore = offer.uptimeSla;
      const outcomeScore = this.getListingOutcome(offer.offerId).avgOutcomeScore;
      const pricePenalty = this._round(offer.priceElo / maxPrice);

      const hybridScore = this._round(
        0.4 * semanticScore +
        0.2 * keywordScore +
        0.15 * ratingScore +
        0.1 * savingScore +
        0.05 * reliabilityScore +
        0.1 * outcomeScore -
        0.05 * pricePenalty
      );

      return {
        offer,
        score: {
          keywordScore,
          semanticScore,
          ratingScore,
          savingScore,
          reliabilityScore,
          outcomeScore,
          pricePenalty,
          hybridScore,
        },
      };
    });

    const valueByMode = (item) => {
      if (mode === "price") return item.offer.priceElo;
      if (mode === "rating") return this._round(item.score.ratingScore * 5);
      if (mode === "saving") return item.score.savingScore;
      if (mode === "outcome") return item.score.outcomeScore;
      return item.score.hybridScore;
    };

    scored.sort((a, b) => {
      const va = valueByMode(a);
      const vb = valueByMode(b);
      if (va === vb) {
        return b.offer.createdAt - a.offer.createdAt;
      }
      return direction === "asc" ? va - vb : vb - va;
    });

    const pageItems = scored.slice(offset, offset + limit);

    return {
      schemaVersion: "market.search.v1",
      query,
      total: scored.length,
      offset,
      limit,
      sort: { mode, direction },
      items: pageItems.map((item, idx) => ({
        rank: offset + idx + 1,
        offer: item.offer,
        score: item.score,
      })),
    };
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

    const safeOfferId = assertToken("offerId", offerId, 128);
    const safeConsumerAgentId = assertToken("consumerAgentId", consumerAgentId, 128);
    const offer = this._offer(safeOfferId);
    this.engine.ownerOf(safeConsumerAgentId);

    if (!Number.isInteger(units) || units <= 0) {
      throw new Error("units must be a positive integer");
    }

    const quote = this.engine.quote({
      providerAgentId: offer.providerAgentId,
      consumerAgentId: safeConsumerAgentId,
      computeUnits: offer.computeUnits * units,
      energyKwh: offer.energyKwh * units,
      marketMultiplier: marketMultiplier ?? offer.marketMultiplier,
      reputationFactor,
      outcomeBonus,
    });

    return {
      ...quote,
      offerId: safeOfferId,
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

    const safeOfferId = assertToken("offerId", offerId, 128);
    const safeConsumerAgentId = assertToken("consumerAgentId", consumerAgentId, 128);
    const safeRequestId = assertToken("requestId", requestId, 128);
    const safeUsageRef = assertBoundedText("usageRef", String(usageRef ?? "market_purchase"), 256) || "market_purchase";
    const offer = this._offer(safeOfferId);
    const result = this.engine.settle({
      providerAgentId: offer.providerAgentId,
      consumerAgentId: safeConsumerAgentId,
      requestId: safeRequestId,
      usageRef: safeUsageRef,
      computeUnits: offer.computeUnits * units,
      energyKwh: offer.energyKwh * units,
      marketMultiplier: marketMultiplier ?? offer.marketMultiplier,
      reputationFactor,
      outcomeBonus,
    });

    this.trades.push({
      offerId: safeOfferId,
      serviceId: offer.serviceId,
      providerAgentId: offer.providerAgentId,
      consumerAgentId: safeConsumerAgentId,
      requestId: safeRequestId,
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

    const safeOfferId = assertToken("offerId", offerId, 128);
    const safeConsumerAgentId = assertToken("consumerAgentId", consumerAgentId, 128);
    const offer = this._offer(safeOfferId);
    const purchaseQuote = this.quotePurchase({
      offerId: safeOfferId,
      consumerAgentId: safeConsumerAgentId,
      units,
      reputationFactor,
      outcomeBonus,
      marketMultiplier,
    });

    const baselineQuote = this.engine.quote({
      providerAgentId: baseline.providerAgentId,
      consumerAgentId: safeConsumerAgentId,
      computeUnits: baseline.computeUnits,
      energyKwh: baseline.energyKwh,
      marketMultiplier: baseline.marketMultiplier,
      reputationFactor: baseline.reputationFactor ?? 1,
      outcomeBonus: baseline.outcomeBonus ?? 0,
    });

    const optimizedQuote = this.engine.quote({
      providerAgentId: optimized.providerAgentId,
      consumerAgentId: safeConsumerAgentId,
      computeUnits: optimized.computeUnits,
      energyKwh: optimized.energyKwh,
      marketMultiplier: optimized.marketMultiplier,
      reputationFactor: optimized.reputationFactor ?? 1,
      outcomeBonus: optimized.outcomeBonus ?? 0,
    });

    const totalWithMarket = this._round(purchaseQuote.amount + optimizedQuote.amount);
    const savingsAmount = this._round(baselineQuote.amount - totalWithMarket);
    const savingsRate = baselineQuote.amount > 0 ? this._round(savingsAmount / baselineQuote.amount) : 0;

    const report = {
      offerId: safeOfferId,
      serviceId: offer.serviceId,
      providerAgentId: offer.providerAgentId,
      consumerAgentId: safeConsumerAgentId,
      baselineAmount: baselineQuote.amount,
      purchaseAmount: purchaseQuote.amount,
      optimizedAmount: optimizedQuote.amount,
      totalWithMarket,
      savingsAmount,
      savingsRate,
      ts: Date.now(),
    };
    this.savingsReports.push(report);
    return report;
  }

  submitReview(params) {
    const {
      reviewId,
      listingId,
      reviewerAgentId,
      rating,
      comment = "",
      tokenSavingObserved,
      latencyScore,
      reliabilityScore,
      usageReceiptRef,
    } = params;

    const safeListingId = assertToken("listingId", listingId, 128);
    const safeReviewerAgentId = assertToken("reviewerAgentId", reviewerAgentId, 128);
    const safeUsageReceiptRef = assertToken("usageReceiptRef", usageReceiptRef, 128);
    const offer = this._offer(safeListingId);
    const score = Number(rating);
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      throw new Error("rating must be an integer between 1 and 5");
    }
    const trade = this.trades.find((x) => x.requestId === safeUsageReceiptRef && x.offerId === safeListingId);
    if (!trade) {
      throw new Error("usageReceiptRef is invalid or not linked to listing");
    }
    if (trade.consumerAgentId !== safeReviewerAgentId) {
      throw new Error("reviewerAgentId must match usage consumer");
    }

    const reviewKey = `${safeListingId}:${safeUsageReceiptRef}:${safeReviewerAgentId}`;
    if (this.reviewReceiptIndex.has(reviewKey)) {
      throw new Error("duplicate review for usage receipt");
    }

    const review = {
      schemaVersion: "review.v1",
      reviewId: reviewId ?? `review-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      listingId: safeListingId,
      providerOwnerId: offer.ownerId,
      reviewerAgentId: safeReviewerAgentId,
      rating: score,
      comment: assertBoundedText("comment", String(comment ?? ""), 1000),
      tokenSavingObserved: this._optionalRate(tokenSavingObserved),
      latencyScore: this._optionalScore(latencyScore),
      reliabilityScore: this._optionalScore(reliabilityScore),
      usageReceiptRef: safeUsageReceiptRef,
      createdAt: Date.now(),
    };

    this.reviews.push(review);
    this.reviewReceiptIndex.add(reviewKey);
    return review;
  }

  listReviews(filters = {}) {
    return this.reviews
      .filter((r) => {
        if (filters.listingId && r.listingId !== filters.listingId) return false;
        if (filters.providerOwnerId && r.providerOwnerId !== filters.providerOwnerId) return false;
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getListingRating(listingId) {
    const rows = this.reviews.filter((x) => x.listingId === listingId);
    return this._ratingSummary(rows);
  }

  getProviderRating(providerOwnerId) {
    const rows = this.reviews.filter((x) => x.providerOwnerId === providerOwnerId);
    return this._ratingSummary(rows);
  }

  evaluateTrade(params) {
    const {
      evaluationId,
      listingId,
      evaluatorAgentId,
      usageReceiptRef,
      baselineAmount,
      actualAmount,
      tokenSavingObserved,
      latencyScore,
      reliabilityScore,
      notes = "",
    } = params;

    const safeListingId = assertToken("listingId", listingId, 128);
    const safeEvaluatorAgentId = assertToken("evaluatorAgentId", evaluatorAgentId, 128);
    const safeUsageReceiptRef = assertToken("usageReceiptRef", usageReceiptRef, 128);
    const offer = this._offer(safeListingId);
    this.engine.ownerOf(safeEvaluatorAgentId);

    const trade = this.trades.find((x) => x.requestId === safeUsageReceiptRef && x.offerId === safeListingId);
    if (!trade) {
      throw new Error("usageReceiptRef is invalid or not linked to listing");
    }
    if (trade.consumerAgentId !== safeEvaluatorAgentId) {
      throw new Error("evaluatorAgentId must match usage consumer");
    }

    const evaluationKey = `${safeListingId}:${safeUsageReceiptRef}:${safeEvaluatorAgentId}`;
    if (this.evaluationReceiptIndex.has(evaluationKey)) {
      throw new Error("duplicate evaluation for usage receipt");
    }

    const verdict = this.outcomeEvaluator.evaluate({
      baselineAmount,
      actualAmount: actualAmount ?? trade.amount,
      tokenSavingObserved,
      latencyScore,
      reliabilityScore,
    });

    const evaluation = {
      schemaVersion: "event.v1",
      evaluationId: evaluationId ?? `eval-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      eventType: "RatingUpdated",
      listingId: safeListingId,
      providerOwnerId: offer.ownerId,
      evaluatorAgentId: safeEvaluatorAgentId,
      usageReceiptRef: safeUsageReceiptRef,
      notes: assertBoundedText("notes", String(notes ?? ""), 1000),
      ...verdict,
      createdAt: Date.now(),
    };

    this.evaluations.push(evaluation);
    this.evaluationReceiptIndex.add(evaluationKey);
    return evaluation;
  }

  listEvaluations(filters = {}) {
    return this.evaluations
      .filter((x) => {
        if (filters.listingId && x.listingId !== filters.listingId) return false;
        if (filters.providerOwnerId && x.providerOwnerId !== filters.providerOwnerId) return false;
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getListingOutcome(listingId) {
    const rows = this.evaluations.filter((x) => x.listingId === listingId);
    return this._outcomeSummary(rows);
  }

  getProviderOutcome(providerOwnerId) {
    const rows = this.evaluations.filter((x) => x.providerOwnerId === providerOwnerId);
    return this._outcomeSummary(rows);
  }

  _ratingSummary(rows) {
    if (!rows.length) return { count: 0, avg: 0 };
    const total = rows.reduce((acc, x) => acc + x.rating, 0);
    return { count: rows.length, avg: this._round(total / rows.length) };
  }

  _outcomeSummary(rows) {
    if (!rows.length) {
      return {
        count: 0,
        avgOutcomeScore: 0,
        avgOutcomeBonus: 0,
        avgSavingRate: 0,
      };
    }
    const count = rows.length;
    const totalOutcomeScore = rows.reduce((acc, x) => acc + x.outcomeScore, 0);
    const totalOutcomeBonus = rows.reduce((acc, x) => acc + x.outcomeBonus, 0);
    const totalSavingRate = rows.reduce((acc, x) => acc + x.savingRate, 0);
    return {
      count,
      avgOutcomeScore: this._round(totalOutcomeScore / count),
      avgOutcomeBonus: this._round(totalOutcomeBonus / count),
      avgSavingRate: this._round(totalSavingRate / count),
    };
  }

  _offer(offerId) {
    const safeOfferId = assertToken("offerId", offerId, 128);
    const offer = this.offers.get(safeOfferId);
    if (!offer) {
      throw new Error(`unknown offerId: ${safeOfferId}`);
    }
    return offer;
  }

  _matchFilters(offer, filters) {
    if (Array.isArray(filters.kind) && filters.kind.length > 0 && !filters.kind.includes(offer.kind)) {
      return false;
    }

    if (Array.isArray(filters.categories) && filters.categories.length > 0) {
      const categories = filters.categories.map((x) => String(x).toLowerCase());
      if (!categories.includes(String(offer.category).toLowerCase())) {
        return false;
      }
    }

    if (Number.isFinite(filters.priceMaxElo) && offer.priceElo > Number(filters.priceMaxElo)) {
      return false;
    }

    if (Array.isArray(filters.pricingMode) && filters.pricingMode.length > 0 && !filters.pricingMode.includes(offer.pricingMode)) {
      return false;
    }

    if (filters.ownerId && String(filters.ownerId) !== offer.ownerId) {
      return false;
    }

    if (Number.isFinite(filters.minTokenSaving) && offer.tokenSavingEstimate < Number(filters.minTokenSaving)) {
      return false;
    }

    if (filters.requireHealthy === true) {
      if (offer.status !== "active") return false;
      if (offer.uptimeSla < 0.95) return false;
    }

    if (Number.isFinite(filters.minRating)) {
      const listingRating = this.getListingRating(offer.offerId).avg;
      const providerRating = this.getProviderRating(offer.ownerId).avg;
      const rating = this._round((listingRating + providerRating) / 2);
      if (rating < Number(filters.minRating)) return false;
    }

    return true;
  }

  _keywordScore(query, offer) {
    const queryTokens = this._tokens(query);
    if (!queryTokens.length) return 0;

    const catalogTokens = this._tokens(this._searchText(offer));
    if (!catalogTokens.length) return 0;

    let matched = 0;
    for (const t of queryTokens) {
      if (catalogTokens.includes(t)) matched += 1;
    }
    return this._round(matched / queryTokens.length);
  }

  _semanticScore(query, offer) {
    const queryTokens = this._tokens(query);
    if (!queryTokens.length) return 0;

    const text = this._searchText(offer);
    let matched = 0;
    for (const t of queryTokens) {
      if (text.includes(t)) {
        matched += 1;
        continue;
      }
      if (t.length >= 5 && text.includes(t.slice(0, 4))) {
        matched += 0.7;
      }
    }

    return this._round(Math.min(1, matched / queryTokens.length));
  }

  _searchText(offer) {
    return [
      offer.kind,
      offer.title,
      offer.summary,
      offer.serviceId,
      offer.category,
      ...(offer.tags ?? []),
      offer.ownerId,
    ]
      .join(" ")
      .toLowerCase();
  }

  _tokens(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, " ")
      .split(/\s+/)
      .filter((x) => x.length >= 2)
      .slice(0, 64);
  }

  _estimateListingPrice(computeUnits, energyKwh, marketMultiplier) {
    const baseCost = Math.max(
      this.engine.pricing.minBaseCost,
      computeUnits * this.engine.pricing.computeUnitRate + energyKwh * this.engine.pricing.energyKwhRate
    );
    return this._round(baseCost * marketMultiplier);
  }

  _asOffset(v) {
    const n = Number(v ?? 0);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.floor(n);
  }

  _asLimit(v) {
    const n = Number(v ?? 20);
    if (!Number.isFinite(n) || n <= 0) return 20;
    return Math.min(100, Math.floor(n));
  }

  _normalizeRate(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, this._round(n)));
  }

  _normalizeNonNegative(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, this._round(n));
  }

  _optionalRate(v) {
    if (v === undefined || v === null) return undefined;
    return this._normalizeRate(v);
  }

  _optionalScore(v) {
    if (v === undefined || v === null) return undefined;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      throw new Error("latencyScore/reliabilityScore must be integer between 1 and 5");
    }
    return n;
  }

  _round(v) {
    return Math.round(v * 1_000_000) / 1_000_000;
  }
}
