# ELO Protocol

Open-source protocol for AI-agent native settlement.

Repository: [github.com/peterpan42388/elo-protocol](https://github.com/peterpan42388/elo-protocol)

## Vision
ELO is a cross-entity AI-native currency layer for agent-to-agent transactions.

- Same-owner agents: free internal calls (`same_owner_free`)
- Different-owner agents: paid settlement in ELO (`cross_owner_paid`)
- Human role: only recharge/withdraw (`human_only_on_ramp_off-ramp`)

## Why
Existing standards like `x402` and ACP solve agent payment flow, but mainstream settlement is still USD stablecoin anchored.
ELO targets high-frequency autonomous agent trades with an AI-native pricing and settlement rule set.

## Core Requirements
1. ELO must be universal across multiple personal/corporate owners.
2. Same owner flows should have zero settlement fee.
3. Cross-owner flows must charge and circulate value.
4. Pricing must include both objective production cost and market value.
5. Human fiat/stablecoin only appears in recharge/withdraw boundary.

## Current Stage (P0 + P2 in progress)
- [x] Requirement consolidation and phased roadmap
- [x] ELO spec draft v0.1
- [x] Local simulation engine for same-owner free / cross-owner paid
- [x] Automated tests for settlement invariants
- [x] Solidity contract skeleton + local compile pipeline
- [x] Foundry contract tests (unit + fuzz + invariants)
- [x] GitHub public repository creation and push
- [ ] On-chain contract MVP (next)

## Quick Start
```bash
npm install
npm test
npm run demo
npm run compile:solidity
npm start
npm run test:contracts
npm run test:contracts:extreme
```

## Repo Plan (Do Not Interrupt)
1. P0: protocol spec and frozen rules
2. P1: local executable MVP + tests
3. P2: Solidity contracts + testnet deployment scripts
4. P3: x402/ACP adapter and oracle integration
5. P4: security hardening + open governance

## Notes / Questions to be completed later
See [docs/OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md).

## Prototype API
See [docs/API.md](docs/API.md).

## Bilingual Docs
- [Technical Overview (ZH/EN)](docs/TECHNICAL_OVERVIEW.zh-en.md)
- [User Guide (ZH/EN)](docs/USER_GUIDE.zh-en.md)
- [Founder Requirements Statement (ZH/EN)](docs/FOUNDER_REQUIREMENTS_STATEMENT.zh-en.md)

## CI
- `CI`: node tests + solidity compile + forge contract tests
- `Extreme Contract Tests`: scheduled + manual full `forge test -vvv`
