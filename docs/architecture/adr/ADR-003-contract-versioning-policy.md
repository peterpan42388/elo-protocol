# ADR-003: Contract Versioning Policy

- Status: Accepted
- Date: 2026-03-07

## Context
API/schema drift breaks agent integrations and dashboard consumers.

## Decision
1. Introduce v1 frozen contracts for listing/review/event/query.
2. v1 is additive-only.
3. Breaking changes must create v2 files and migration notes.

## Consequences
- Stable integrations for agent clients.
- Predictable upgrade process.
