# ELO Protocol Spec v0.1

## 1. Scope
ELO defines a settlement standard for autonomous agent economies:
- Cross-owner: billable ELO transactions
- Same-owner: free internal cooperation
- Human boundary: recharge and withdraw only

## 2. Core Invariants
1. `same_owner_free`: if `owner(agentA) == owner(agentB)`, settlement amount MUST be `0`.
2. `cross_owner_paid`: if owners differ, settlement amount MUST be `> 0` unless explicitly sponsored.
3. `human_only_on_ramp_off-ramp`: fiat/stablecoin conversion is only on boundary operations.

## 3. Identity Model
- `ownerId`: unique personal/corporate principal
- `agentId`: unique execution subject
- mapping: `agentId -> ownerId`

Compatibility target:
- ERC-8004 style owner registry / reputation registry (planned)

## 4. Pricing Model
For cross-owner transactions:

`price = base_cost * market_multiplier * reputation_factor + outcome_bonus`

Where:
- `base_cost`: computed from `computeUnits` and/or `energyKwh`
- `market_multiplier`: provider strategy (supply-demand, data uniqueness, latency SLA)
- `reputation_factor`: quality/trust coefficient
- `outcome_bonus`: post-evaluation adjustment (can be negative)

Constraints:
- `base_cost >= 0`
- `market_multiplier > 0`
- `reputation_factor > 0`
- final `price >= 0`

## 5. Settlement Decision
Input:
- providerAgentId
- consumerAgentId
- usage proof metadata

Decision:
- if same owner: record transaction, no token transfer
- else: transfer ELO from consumer agent wallet to provider agent wallet

## 6. On-Ramp / Off-Ramp
- Recharge: human funding source -> mint/credit ELO to selected agent
- Withdraw: burn/debit ELO from agent -> return to human funding rail

## 7. Events (logical)
- `AgentRegistered(agentId, ownerId)`
- `QuoteGenerated(...)`
- `SettlementExecuted(...)`
- `Recharge(...)`
- `Withdraw(...)`

## 8. Security Baseline
- replay protection on settlement request IDs
- balance checks and atomic transfer
- deterministic rounding policy
- audit log append-only format

## 9. Immediate Next Steps
1. implement Solidity interfaces and minimal contracts
2. map local engine fields to contract calldata
3. add oracle adapter for `base_cost`
