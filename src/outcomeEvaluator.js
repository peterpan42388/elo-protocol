export class DefaultOutcomeEvaluator {
  evaluate(params) {
    const baselineAmount = Number(params?.baselineAmount);
    const actualAmount = Number(params?.actualAmount);
    const tokenSavingObserved = params?.tokenSavingObserved;
    const latencyScore = params?.latencyScore;
    const reliabilityScore = params?.reliabilityScore;

    if (!Number.isFinite(baselineAmount) || baselineAmount <= 0) {
      throw new Error("baselineAmount must be > 0");
    }
    if (!Number.isFinite(actualAmount) || actualAmount < 0) {
      throw new Error("actualAmount must be >= 0");
    }

    const measuredSavingRate = this._clamp((baselineAmount - actualAmount) / baselineAmount, -1, 1);
    const observedSavingRate =
      tokenSavingObserved === undefined || tokenSavingObserved === null
        ? measuredSavingRate
        : this._clamp(Number(tokenSavingObserved), -1, 1);

    const savingRate = this._round((measuredSavingRate + observedSavingRate) / 2);
    const latency = this._normalizeOptionalScore(latencyScore);
    const reliability = this._normalizeOptionalScore(reliabilityScore);
    const qualityScore = this._round(this._quality(latency, reliability));

    const outcomeScore = this._round(this._clamp(0.65 * Math.max(0, savingRate) + 0.35 * qualityScore, 0, 1));
    const outcomeBonus = this._round(this._clamp(savingRate * 0.2 + (qualityScore - 0.6) * 0.1, -0.3, 0.3));

    return {
      baselineAmount: this._round(baselineAmount),
      actualAmount: this._round(actualAmount),
      measuredSavingRate: this._round(measuredSavingRate),
      observedSavingRate: this._round(observedSavingRate),
      savingRate,
      qualityScore,
      outcomeScore,
      outcomeBonus,
    };
  }

  _quality(latencyScore, reliabilityScore) {
    const defaultScore = 0.6;
    const lat = latencyScore ?? defaultScore;
    const rel = reliabilityScore ?? defaultScore;
    return this._clamp(0.45 * lat + 0.55 * rel, 0, 1);
  }

  _normalizeOptionalScore(v) {
    if (v === undefined || v === null) return undefined;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      throw new Error("latencyScore/reliabilityScore must be integer between 1 and 5");
    }
    return this._round((n - 1) / 4);
  }

  _clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  _round(v) {
    return Math.round(v * 1_000_000) / 1_000_000;
  }
}
