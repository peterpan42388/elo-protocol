# ELO Protocol Rules (ZH/EN)

## 中文

### 规则集（MUST/SHOULD）
1. MUST: 每个 `agentId` 必须绑定且仅绑定一个 `ownerId`。
2. MUST: 同归属结算金额必须为 0，不得发生资产转移。
3. MUST: 跨归属结算金额必须大于等于 0，且默认应大于 0。
4. MUST: 每个结算请求必须携带唯一 `requestId`，重复请求必须拒绝。
5. MUST: 付费结算必须由消费方代理发起。
6. MUST: 余额不足时拒绝跨归属结算。
7. MUST: 风险策略拒绝时必须中止结算并可审计。
8. MUST: 审计/评价类 receipt 必须去重绑定。
9. SHOULD: x402/acp 状态缓存必须有容量上限与过期清理。
10. SHOULD: API 写接口启用可选鉴权（`API_AUTH_BEARER_TOKEN`）。
11. SHOULD: 关键安全门禁（P4B/P4C/P4E/P4F）纳入 CI。
12. SHOULD: 发布前执行阻断规则，确保无高风险活跃发现。

### 规则执行映射
- 协议实现：`src/settlementEngine.js`, `contracts/SettlementEngine.sol`
- 市场实现：`src/eloMarket.js`
- 安全执行：`scripts/check-security-sla.mjs`, `scripts/check-release-blockers.mjs`

## English

### Rules (MUST/SHOULD)
1. MUST: each `agentId` maps to exactly one `ownerId`.
2. MUST: same-owner settlements are zero-cost and non-transfer.
3. MUST: cross-owner settlements are non-negative and billable by default.
4. MUST: each settlement carries a unique `requestId`; replay must be rejected.
5. MUST: paid settlements are initiated by the consumer agent.
6. MUST: reject cross-owner settlement on insufficient balance.
7. MUST: risk-policy rejection aborts settlement with audit trace.
8. MUST: review/evaluation receipts are deduplicated.
9. SHOULD: x402/acp caches are bounded and cleaned up.
10. SHOULD: mutation APIs enforce optional auth (`API_AUTH_BEARER_TOKEN`).
11. SHOULD: P4B/P4C/P4E/P4F security gates run in CI.
12. SHOULD: release blocking rules are executed before release.

### Enforcement map
- Protocol: `src/settlementEngine.js`, `contracts/SettlementEngine.sol`
- Market: `src/eloMarket.js`
- Security execution: `scripts/check-security-sla.mjs`, `scripts/check-release-blockers.mjs`
