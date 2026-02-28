# ELO Risk Extension (Private)

Private repository for production-grade risk strategies and policy adapters for ELO.

## Purpose
This repository stores **private risk logic** that should not be publicly exposed in the protocol core repo.

- Fraud and abuse detection strategies
- Dynamic rate-limit and threshold policies
- Sanctions / compliance policy connectors
- Runtime policy tuning and emergency controls

## Relation with Public Repo
- Public core: https://github.com/peterpan42388/elo-protocol
- This repo: private implementation of pluggable policy adapters

## Structure
- `policies/`: production policy modules
- `examples/`: safe mock examples for local integration tests
- `docs/`: runbooks and risk operations guidance

## Baseline Rules
1. Never commit secrets/private keys.
2. Keep policy implementation details private.
3. Validate against ELO core invariants before release.
