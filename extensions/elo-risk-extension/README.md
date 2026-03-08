# ELO Risk Extension (Open)

Open-source risk strategy and policy adapter module for ELO.

## Purpose
This module stores pluggable risk logic for ELO and is now maintained in the public `elo-protocol` repository under `extensions/elo-risk-extension/`.

- Fraud and abuse detection strategies
- Dynamic rate-limit and threshold policies
- Sanctions / compliance policy connectors
- Runtime policy tuning and emergency controls

## Relation with Public Repo
- Public core: https://github.com/peterpan42388/elo-protocol
- This module: merged public implementation of pluggable policy adapters

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
- `src/`: policy implementations
- `test/`: policy tests
- `script/`: deployment scripts
- `docs/`: architecture and runbooks

## Baseline Rules
1. Never commit secrets/private keys.
2. Keep secrets and runtime credentials out of source control.
3. Validate against ELO core invariants before release.
