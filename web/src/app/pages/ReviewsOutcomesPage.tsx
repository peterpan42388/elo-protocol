import { useCallback, useEffect, useState } from "react";
import { SectionHeader } from "../components/ui/SectionHeader";
import { formatPercent, formatTs, toShortId } from "../lib/format";
import type { DashboardOutcomes, Evaluation, Review } from "../lib/types";
import { useApiClient } from "../state/api";
import { useAuth } from "../state/auth";

export function ReviewsOutcomesPage() {
  const api = useApiClient();
  const { auth } = useAuth();

  const [listingIdFilter, setListingIdFilter] = useState("");
  const [providerOwnerFilter, setProviderOwnerFilter] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [outcomes, setOutcomes] = useState<DashboardOutcomes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"review" | "evaluation">("review");
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [listingId, setListingId] = useState("");
  const [actorAgentId, setActorAgentId] = useState(auth.defaultConsumerAgentId);
  const [usageReceiptRef, setUsageReceiptRef] = useState("");
  const [rating, setRating] = useState(5);
  const [tokenSavingObserved, setTokenSavingObserved] = useState("0.3");
  const [comment, setComment] = useState("");
  const [baselineAmount, setBaselineAmount] = useState("10");
  const [actualAmount, setActualAmount] = useState("6");
  const [latencyScore, setLatencyScore] = useState("4");
  const [reliabilityScore, setReliabilityScore] = useState("5");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {
        listingId: listingIdFilter.trim() || undefined,
        providerOwnerId: providerOwnerFilter.trim() || undefined,
      };
      const [reviewsRes, evaluationsRes, outcomesRes] = await Promise.all([
        api.listReviews(filters),
        api.listEvaluations(filters),
        api.getDashboardOutcomes(50),
      ]);

      setReviews(reviewsRes.reviews);
      setEvaluations(evaluationsRes.evaluations);
      setOutcomes(outcomesRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load review data");
    } finally {
      setLoading(false);
    }
  }, [api, listingIdFilter, providerOwnerFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit() {
    if (!listingId.trim() || !actorAgentId.trim() || !usageReceiptRef.trim()) {
      setSubmitError("listingId / agentId / usageReceiptRef are required");
      return;
    }

    setSubmitBusy(true);
    setSubmitError(null);

    try {
      if (modalMode === "review") {
        await api.submitReview({
          listingId: listingId.trim(),
          reviewerAgentId: actorAgentId.trim(),
          rating,
          usageReceiptRef: usageReceiptRef.trim(),
          tokenSavingObserved: Number(tokenSavingObserved),
          comment,
          latencyScore: Number(latencyScore),
          reliabilityScore: Number(reliabilityScore),
        });
      } else {
        await api.submitEvaluation({
          listingId: listingId.trim(),
          evaluatorAgentId: actorAgentId.trim(),
          usageReceiptRef: usageReceiptRef.trim(),
          baselineAmount: Number(baselineAmount),
          actualAmount: Number(actualAmount),
          tokenSavingObserved: Number(tokenSavingObserved),
          latencyScore: Number(latencyScore),
          reliabilityScore: Number(reliabilityScore),
          notes,
        });
      }

      setIsModalOpen(false);
      await load();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "failed to submit");
    } finally {
      setSubmitBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        title="Reviews & Outcomes"
        description="Capture usage feedback and evaluate service quality with outcome-linked scoring."
        actions={
          <>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setModalMode("review");
                setSubmitError(null);
                setIsModalOpen(true);
              }}
            >
              Submit Review
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={() => {
                setModalMode("evaluation");
                setSubmitError(null);
                setIsModalOpen(true);
              }}
            >
              Submit Evaluation
            </button>
          </>
        }
      />

      <section className="panel split-panel">
        <div className="field-grid">
          <input
            className="input code"
            placeholder="Listing ID"
            value={listingIdFilter}
            onChange={(event) => setListingIdFilter(event.target.value)}
          />
          <input
            className="input code"
            placeholder="Provider Owner ID"
            value={providerOwnerFilter}
            onChange={(event) => setProviderOwnerFilter(event.target.value)}
          />
        </div>
        <button className="button button-secondary" type="button" onClick={() => void load()} disabled={loading}>
          {loading ? "Loading..." : "Apply"}
        </button>
      </section>

      {error ? <p className="status-error">{error}</p> : null}

      <section className="panel">
        <h2>Outcome Aggregate</h2>
        <div className="kpi-grid kpi-grid-compact">
          <div className="metric-card">
            <p className="metric-label">Avg Outcome</p>
            <p className="metric-value">{outcomes ? outcomes.aggregates.avgOutcomeScore.toFixed(2) : "--"}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Avg Bonus</p>
            <p className="metric-value">{outcomes ? outcomes.aggregates.avgOutcomeBonus.toFixed(2) : "--"}</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Avg Saving</p>
            <p className="metric-value">{outcomes ? formatPercent(outcomes.aggregates.avgSavingRate) : "--"}</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Latest Reviews</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Saving</th>
                <th>Receipt</th>
                <th>At</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length ? (
                reviews.slice(0, 20).map((review) => (
                  <tr key={review.reviewId}>
                    <td>{toShortId(review.listingId)}</td>
                    <td>{toShortId(review.reviewerAgentId)}</td>
                    <td>{review.rating}</td>
                    <td>{review.tokenSavingObserved != null ? formatPercent(review.tokenSavingObserved) : "--"}</td>
                    <td>{toShortId(review.usageReceiptRef)}</td>
                    <td>{formatTs(review.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No reviews yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Latest Evaluations</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Evaluator</th>
                <th>Outcome</th>
                <th>Bonus</th>
                <th>Saving</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.length ? (
                evaluations.slice(0, 20).map((evaluation) => (
                  <tr key={evaluation.evaluationId}>
                    <td>{toShortId(evaluation.listingId)}</td>
                    <td>{toShortId(evaluation.evaluatorAgentId)}</td>
                    <td>{evaluation.outcomeScore.toFixed(2)}</td>
                    <td>{evaluation.outcomeBonus.toFixed(2)}</td>
                    <td>{formatPercent(evaluation.savingRate)}</td>
                    <td>{toShortId(evaluation.usageReceiptRef)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No evaluations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="submit modal">
          <div className="modal-card">
            <header className="modal-header">
              <h2>{modalMode === "review" ? "Submit Review" : "Submit Evaluation"}</h2>
              <button className="button button-ghost" type="button" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </header>

            <div className="modal-body">
              <label className="label">
                Listing ID
                <input className="input code" value={listingId} onChange={(event) => setListingId(event.target.value)} />
              </label>

              <label className="label">
                {modalMode === "review" ? "Reviewer Agent ID" : "Evaluator Agent ID"}
                <input
                  className="input code"
                  value={actorAgentId}
                  onChange={(event) => setActorAgentId(event.target.value)}
                />
              </label>

              <label className="label">
                Usage Receipt Ref
                <input
                  className="input code"
                  value={usageReceiptRef}
                  onChange={(event) => setUsageReceiptRef(event.target.value)}
                />
              </label>

              {modalMode === "review" ? (
                <>
                  <label className="label">
                    Rating (1-5)
                    <input
                      className="input"
                      type="number"
                      min={1}
                      max={5}
                      value={rating}
                      onChange={(event) => setRating(Math.max(1, Math.min(5, Number(event.target.value || 5))))}
                    />
                  </label>

                  <label className="label">
                    Comment
                    <textarea className="textarea" value={comment} onChange={(event) => setComment(event.target.value)} rows={3} />
                  </label>
                </>
              ) : (
                <>
                  <div className="field-grid">
                    <label className="label">
                      Baseline Amount
                      <input
                        className="input"
                        type="number"
                        min={0}
                        value={baselineAmount}
                        onChange={(event) => setBaselineAmount(event.target.value)}
                      />
                    </label>
                    <label className="label">
                      Actual Amount
                      <input
                        className="input"
                        type="number"
                        min={0}
                        value={actualAmount}
                        onChange={(event) => setActualAmount(event.target.value)}
                      />
                    </label>
                  </div>
                  <label className="label">
                    Notes
                    <textarea className="textarea" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
                  </label>
                </>
              )}

              <div className="field-grid">
                <label className="label">
                  Saving Observed
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={tokenSavingObserved}
                    onChange={(event) => setTokenSavingObserved(event.target.value)}
                  />
                </label>
                <label className="label">
                  Latency Score
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={5}
                    value={latencyScore}
                    onChange={(event) => setLatencyScore(event.target.value)}
                  />
                </label>
                <label className="label">
                  Reliability Score
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={5}
                    value={reliabilityScore}
                    onChange={(event) => setReliabilityScore(event.target.value)}
                  />
                </label>
              </div>

              {submitError ? <p className="status-error">{submitError}</p> : null}
            </div>

            <footer className="modal-footer">
              <button className="button button-secondary" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="button button-primary" type="button" onClick={() => void submit()} disabled={submitBusy}>
                {submitBusy ? "Submitting..." : "Submit"}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
