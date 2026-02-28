# Governance

## Decision Model
- Protocol invariants require maintainer approval and passing CI.
- Security-sensitive changes require at least one additional reviewer.
- Breaking changes require migration documentation.

## Maintainers
- Owner: @peterpan42388

## Proposal Process
1. Open an issue with problem statement and threat model.
2. Submit PR with tests and migration note (if needed).
3. Merge only after required checks pass.

## Rule Integrity
The following invariants cannot be changed without explicit governance decision:
- `same_owner_free`
- `cross_owner_paid`
- replay protection using unique `requestId`
