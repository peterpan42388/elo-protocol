import { useCallback, useEffect, useMemo, useState } from "react";
import { MetricCard } from "../components/ui/MetricCard";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Sparkline } from "../components/ui/Sparkline";
import { formatElo, formatPercent, formatTs, toShortId } from "../lib/format";
import type { DashboardMarketEfficiency, DashboardOutcomes, DashboardSummary } from "../lib/types";
import { useApiClient } from "../state/api";

export function OverviewPage() {
  const api = useApiClient();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [efficiency, setEfficiency] = useState<DashboardMarketEfficiency | null>(null);
  const [outcomes, setOutcomes] = useState<DashboardOutcomes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, efficiencyRes, outcomesRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardMarketEfficiency(8),
        api.getDashboardOutcomes(20),
      ]);
      setSummary(summaryRes);
      setEfficiency(efficiencyRes);
      setOutcomes(outcomesRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const kpis = useMemo(() => {
    if (!summary) {
      return [
        { label: "Agents", value: "--" },
        { label: "Offers", value: "--" },
        { label: "Trades", value: "--" },
        { label: "Avg Outcome", value: "--" },
        { label: "Efficiency", value: "--" },
      ];
    }

    return [
      { label: "Agents", value: String(summary.kpis.agentCount) },
      { label: "Offers", value: String(summary.kpis.offerCount) },
      { label: "Trades", value: String(summary.kpis.tradeCount) },
      {
        label: "Avg Outcome",
        value: outcomes ? outcomes.aggregates.avgOutcomeScore.toFixed(2) : "--",
      },
      {
        label: "Efficiency",
        value: efficiency ? formatPercent(efficiency.aggregates.avgSavingsRate) : "--",
      },
    ];
  }, [summary, outcomes, efficiency]);

  const trendValues = useMemo(() => {
    if (!efficiency) return [];
    return efficiency.items
      .slice()
      .reverse()
      .map((item) => item.avgSavingsRate);
  }, [efficiency]);

  return (
    <div className="page-stack">
      <SectionHeader
        title="ELO Market Dashboard"
        description="Track market health, efficiency, and outcomes for your AI service economy."
        actions={
          <button className="button button-secondary" type="button" onClick={() => void loadDashboard()} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        }
      />

      {error ? <p className="status-error">{error}</p> : null}

      <section className="kpi-grid">
        {kpis.map((kpi) => (
          <MetricCard key={kpi.label} label={kpi.label} value={kpi.value} />
        ))}
      </section>

      <section className="panel">
        <div className="trend-head">
          <h2>Market Efficiency Trend</h2>
          <p className="panel-subtitle">Average savings trend from top listings.</p>
        </div>
        <Sparkline values={trendValues} />
      </section>

      <section className="panel">
        <h2>Top Listings</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Offer</th>
                <th>Trades</th>
                <th>Volume</th>
                <th>Savings</th>
                <th>Outcome</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {efficiency?.items?.length ? (
                efficiency.items.slice(0, 6).map((item) => (
                  <tr key={item.offerId}>
                    <td>{toShortId(item.offerId)}</td>
                    <td>{item.tradeCount}</td>
                    <td>{formatElo(item.volumeElo)}</td>
                    <td>{formatPercent(item.avgSavingsRate)}</td>
                    <td>{item.outcomeScore.toFixed(2)}</td>
                    <td>{formatTs(item.lastTradeAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No market data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
