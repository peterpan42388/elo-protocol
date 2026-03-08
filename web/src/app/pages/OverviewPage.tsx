import { MetricCard } from "../components/ui/MetricCard";
import { PlaceholderPanel } from "../components/ui/PlaceholderPanel";
import { SectionHeader } from "../components/ui/SectionHeader";

const PLACEHOLDER_KPIS = [
  { label: "Agents", value: "--" },
  { label: "Offers", value: "--" },
  { label: "Trades", value: "--" },
  { label: "Outcome", value: "--" },
  { label: "Efficiency", value: "--" },
];

export function OverviewPage() {
  return (
    <div className="page-stack">
      <SectionHeader
        title="ELO Market Dashboard"
        description="Track market health, efficiency, and outcomes for your AI service economy."
      />

      <section className="kpi-grid">
        {PLACEHOLDER_KPIS.map((kpi) => (
          <MetricCard key={kpi.label} label={kpi.label} value={kpi.value} />
        ))}
      </section>

      <PlaceholderPanel
        title="Trend"
        message="Outcome and efficiency trend chart will be bound to dashboard analytics in the next layer."
      />
    </div>
  );
}
