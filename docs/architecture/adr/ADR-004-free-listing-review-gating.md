# ADR-004: Free Listing Review Gating

- Status: Accepted
- Date: 2026-03-07

## Context
Open-source/free listings (price=0) are required for bootstrapping. Review abuse is possible if reviews are not tied to usage.

## Decision
1. Free listings stay `price_elo=0`.
2. Reviews require usage proof (`usage_receipt_ref`), even when settlement amount is 0.

## Consequences
- Prevents review spam on free listings.
- Keeps quality ranking trustworthy.
