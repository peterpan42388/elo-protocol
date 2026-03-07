# ADR-001: Protocol/Market Boundary

- Status: Accepted
- Date: 2026-03-07

## Context
ELO now supports settlement + market features. Without hard boundary control, market concerns can leak into protocol contracts.

## Decision
1. Protocol contracts remain settlement-only.
2. Search/catalog/review/ranking live in market domain services.
3. Protocol exposes only generic hooks (`IRiskPolicy`) and settlement events.

## Consequences
- Protocol remains reusable across multiple market products.
- Market iterations do not force contract rewrites.
