# ELO Risk Extension (Private)

Private repository for production-grade risk strategies and policy adapters for ELO.

## Purpose
This repository stores private risk logic that should not be publicly exposed in the protocol core repo.

- Fraud and abuse detection strategies
- Dynamic rate-limit and threshold policies
- Sanctions / compliance policy connectors
- Runtime policy tuning and emergency controls

## Relation with Public Repo
- Public core: https://github.com/peterpan42388/elo-protocol
- This repo: private implementation of pluggable policy adapters

## Delivered Policy (v1)
- `AdaptiveRiskPolicy.sol`
  - blacklist controls (provider/consumer)
  - per-window transaction rate limiting
  - dynamic amount threshold based on recent window usage
  - replay-safe state recording with requestId

## Commands
```bash
forge test -vv
```

Deploy script:
- `script/DeployAdaptiveRiskPolicy.s.sol`

## Structure
- `src/`: private policy implementations
- `test/`: policy tests
- `script/`: deployment scripts
- `docs/`: architecture and runbooks

## Baseline Rules
1. Never commit secrets/private keys.
2. Keep policy implementation details private.
3. Validate against ELO core invariants before release.
