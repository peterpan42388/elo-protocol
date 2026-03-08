import { PlaceholderPanel } from "../components/ui/PlaceholderPanel";
import { SectionHeader } from "../components/ui/SectionHeader";

export function ReviewsOutcomesPage() {
  return (
    <div className="page-stack">
      <SectionHeader
        title="Reviews & Outcomes"
        description="Capture usage feedback and evaluate service quality with outcome-linked scoring."
      />

      <section className="panel split-panel">
        <div>
          <h2>Filters</h2>
          <div className="field-grid">
            <input className="input" placeholder="Listing ID" disabled />
            <input className="input" placeholder="Provider Owner ID" disabled />
          </div>
        </div>
        <button className="button button-secondary" type="button" disabled>
          Submit Review
        </button>
      </section>

      <PlaceholderPanel
        title="Evaluations"
        message="Review submission modal and outcome tables will be enabled after API client integration."
      />
    </div>
  );
}
