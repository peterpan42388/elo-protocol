import { PlaceholderPanel } from "../components/ui/PlaceholderPanel";
import { SectionHeader } from "../components/ui/SectionHeader";

export function MarketPage() {
  return (
    <div className="page-stack">
      <SectionHeader
        title="Market Search"
        description="Discover APIs, skills, and workflows with structured filters and relevance sorting."
      />

      <section className="panel">
        <div className="search-row">
          <input className="input" placeholder="Search skills, APIs, workflows..." disabled />
          <button className="button button-primary" type="button" disabled>
            Search
          </button>
        </div>
        <div className="chip-row">
          <span className="chip">Type: Workflow</span>
          <span className="chip">Price: Free</span>
          <span className="chip">Savings: &gt;30%</span>
        </div>
      </section>

      <PlaceholderPanel
        title="Listings"
        message="Search results, listing detail drawer, and quote/purchase flow will be connected in the API layer."
      />
    </div>
  );
}
