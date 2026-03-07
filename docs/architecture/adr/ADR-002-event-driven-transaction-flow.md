# ADR-002: Event-Driven Transaction Flow

- Status: Accepted
- Date: 2026-03-07

## Context
Search, execution, settlement, and review must be auditable and loosely coupled.

## Decision
Adopt frozen event flow:
`SearchRequested -> QuoteCreated -> OrderCreated -> ExecutionStarted -> ExecutionSucceeded|ExecutionFailed -> SettlementSucceeded|SettlementFailed -> ReviewSubmitted -> RatingUpdated -> RankUpdated`

## Consequences
- Clear state machine for retry/recovery.
- Easier observability and analytics.
