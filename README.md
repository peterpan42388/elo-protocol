# ELO Protocol

Open-source protocol for AI-agent native settlement.

## Project Rules (Must Read First)
- All contributors (human or AI) must read: [docs/Rules/Rule.md](docs/Rules/Rule.md)
- Rules directory index: [docs/Rules/README.md](docs/Rules/README.md)

> [!WARNING]
> **Legal Notice / 法律声明**  
> This project is an exploratory open-source reference implementation, **not** a commercial operating entity or financial service.  
> Please read the full bilingual disclaimer before any use, fork, deployment, or commercialization:  
> [Project Disclaimer (ZH/EN)](docs/PROJECT_DISCLAIMER.zh-en.md)

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

## Current Stage (P0 + P2 verified, P3 scaffold in progress)
- [x] Requirement consolidation and phased roadmap
- [x] ELO spec draft v0.1
- [x] Local simulation engine for same-owner free / cross-owner paid
- [x] Automated tests for settlement invariants
- [x] Solidity contract skeleton + local compile pipeline
- [x] Foundry contract tests (unit + fuzz + invariants)
- [x] GitHub public repository creation and push
- [x] Virtual wallet bootstrap + local test funding script
- [x] P0/P2 market scenario tests (token-saving simulation)
- [x] P3 market API scaffold (publish/quote/purchase/savings simulation)
- [x] P3-A architecture freeze package (ADR + v1 schemas)
- [x] P3-B search/review baseline (`/market/search`, usage-linked reviews)
- [x] P3-C outcome evaluator baseline (`/market/evaluations/*`, outcome-aware ranking)
- [x] P3-D x402 adapter baseline (`/market/x402/challenge` -> `/market/x402/settle`)
- [x] P3-E ACP negotiation + escrow baseline (`intent -> accept -> fund -> execute`)
- [x] P3-F dashboard analytics extension (`/dashboard/market-efficiency`, `/dashboard/outcomes`)
- [x] P4-A security hardening baseline (rate limit, body size guard, input validation)
- [x] P4-B audit prep baseline (threat model, risk matrix, checklist, regression gates)
- [x] P4-C security review drill report (findings + mitigations)
- [x] P4-D optional API bearer-auth baseline (`API_AUTH_BEARER_TOKEN`)
- [x] P4-E external audit execution pack (scope/SLA/template/gates)
- [x] P4-F finding closure loop (triage board + SLA checker + release blocker gate)
- [x] P4-G human web console baseline (`web/`, market dashboard/search/purchase/review/wallet)
- [ ] On-chain contract MVP for market execution (next)

## Quick Start
```bash
npm install
npm test
npm run demo
npm run compile:solidity
npm start
npm run test:contracts
npm run test:contracts:extreme
npm run integrate:risk:local
npm run wallet:virtual
npm run test:p0p2:local
npm run demo:market
npm run test:dashboard-contract
npm run verify:p3a-freeze
npm run verify:p4b-audit-prep
npm run verify:p4c-security-review
npm run verify:p4e-audit-execution
npm run verify:p4f-closure
npm run security:sla:check
npm run release:block:check
npm run web:dev
npm run web:build
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

## Web Console
See [web/README.md](web/README.md).

## Engineering Rules
- [Rules / 开源工程规则目录](docs/Rules/README.md)
- [Rule (Must Read First)](docs/Rules/Rule.md)
- [Spirit](docs/Rules/Spirit.md)
- [Target](docs/Rules/Target.md)
- [Legality](docs/Rules/Legality.md)
- [Review](docs/Rules/Review.md)
- [Rejection](docs/Rules/Rejection.md)

## Project History
- [History Directory](docs/History/README.md)
- [History](docs/History/History.md)
- [MindJourney](docs/History/MindJourney.md)

## Bilingual Docs
- [OSCP Spec (ZH/EN)](docs/OSCP_SPEC.zh-en.md)
- [OSCP Roadmap (ZH/EN)](docs/OSCP_ROADMAP.zh-en.md)
- [OSCP Skills (ZH/EN)](docs/OSCP_SKILLS.zh-en.md)
- [Technical Overview (ZH/EN)](docs/TECHNICAL_OVERVIEW.zh-en.md)
- [System Architecture (ZH/EN)](docs/SYSTEM_ARCHITECTURE.zh-en.md)
- [Protocol Rules (ZH/EN)](docs/PROTOCOL_RULES.zh-en.md)
- [Usage Playbook (ZH/EN)](docs/USAGE_PLAYBOOK.zh-en.md)
- [Production Go-Live Checklist (ZH/EN)](docs/PRODUCTION_GO_LIVE_CHECKLIST.zh-en.md)
- [User Guide (ZH/EN)](docs/USER_GUIDE.zh-en.md)
- [Founder Requirements Statement (ZH/EN)](docs/FOUNDER_REQUIREMENTS_STATEMENT.zh-en.md)
- [Project Disclaimer (ZH/EN)](docs/PROJECT_DISCLAIMER.zh-en.md)
- [Base Sepolia Deployment Guide (ZH/EN)](docs/DEPLOYMENT_BASE_SEPOLIA.zh-en.md)
- [Risk Plugin Interface (ZH/EN)](docs/RISK_PLUGIN_INTERFACE.zh-en.md)
- [Risk Integration Runbook (ZH/EN)](docs/PRIVATE_RISK_INTEGRATION_RUNBOOK.zh-en.md)
- [ELO Market Execution Plan (ZH/EN)](docs/ELO_MARKET_EXECUTION_PLAN.zh-en.md)
- [Dashboard API Contract v1 (ZH/EN)](docs/DASHBOARD_API_CONTRACT.v1.zh-en.md)
- [P3-A Architecture Freeze (ZH/EN)](docs/architecture/P3A_ARCHITECTURE_FREEZE.zh-en.md)
- [P4-B Audit Prep (ZH/EN)](docs/security/P4B_AUDIT_PREP.zh-en.md)
- [Threat Model (ZH/EN)](docs/security/THREAT_MODEL.zh-en.md)
- [Risk Matrix (ZH/EN)](docs/security/RISK_MATRIX.zh-en.md)
- [Security Review Checklist (ZH/EN)](docs/security/SECURITY_REVIEW_CHECKLIST.zh-en.md)
- [Regression Strategy (ZH/EN)](docs/security/REGRESSION_STRATEGY.zh-en.md)
- [P4-C Security Review Report (ZH/EN)](docs/security/P4C_SECURITY_REVIEW_REPORT.zh-en.md)
- [P4-E External Audit Execution Pack (ZH/EN)](docs/security/P4E_EXTERNAL_AUDIT_EXECUTION.zh-en.md)
- [P4-F Finding Closure (ZH/EN)](docs/security/P4F_FINDING_CLOSURE.zh-en.md)
- [P4-F Findings Triage Board (ZH/EN)](docs/security/P4F_FINDINGS_TRIAGE_BOARD.zh-en.md)
- [P4-F Release Block Rules (ZH/EN)](docs/security/P4F_RELEASE_BLOCK_RULES.zh-en.md)

## CI
- `CI`: node tests + solidity compile + core forge contract tests (`SettlementEngine`)
- `Extreme Contract Tests`: scheduled + manual full profile (fuzz + invariants)
- `Security Policy Check`: secret leakage scan (gitleaks)

## Open Scope Policy
- Open-source scope: [docs/OPEN_SOURCE_SCOPE.zh-en.md](docs/OPEN_SOURCE_SCOPE.zh-en.md)
- Management plan: [docs/OPEN_SOURCE_MANAGEMENT_PLAN.zh-en.md](docs/OPEN_SOURCE_MANAGEMENT_PLAN.zh-en.md)
- Governance: [GOVERNANCE.md](GOVERNANCE.md)
- Security policy: [SECURITY.md](SECURITY.md)
- Risk extension module (merged, open-source): `extensions/elo-risk-extension/`
