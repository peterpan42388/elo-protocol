# ELO Production Go-Live Checklist (ZH/EN)

## 中文

> 目标：把当前“可人工测试系统”推进到“可真实资金运行系统”。

### A. 合约与协议
1. 主网部署版本冻结（tag + commit + bytecode hash）。
2. 外部审计执行完成，Critical/High 为 0 或有 signed accepted risk。
3. 合约权限最小化（owner/registrar/minter 多签与延迟执行）。
4. 升级与回滚策略明确（是否可升级、如何紧急暂停）。

### B. 钱包与密钥
1. 生产密钥进入 KMS/HSM/MPC（禁止明文私钥）。
2. 交易签名分层：热钱包限额、冷钱包托管。
3. Key rotation 与应急吊销演练完成。
4. 链上资金账户与运营账户隔离。

### C. 充值/提现（真实 Crypto On-Ramp）
1. 明确支持资产：建议先单资产（如 USDC on Base）。
2. 对接托管与清结算通道（如交易所企业账户/支付通道/托管商）。
3. 建立充值确认规则：最小确认数、最小金额、到账 SLA。
4. 建立提现风控：白名单地址、日限额、人工复核阈值。
5. 建立对账系统：链上流水 vs 内部账本每日对账。
6. 建立手续费模型：gas 预算、补贴规则、失败重试策略。

### D. 鉴权与反滥用
1. 启用 `API_AUTH_BEARER_TOKEN` 与 `API_AUTH_HMAC_SECRET`。
2. API key 生命周期：签发、过期、吊销、配额。
3. 时间窗防重放（`API_AUTH_HMAC_WINDOW_MS`）和请求日志追踪。
4. 接入边缘防护：Cloudflare WAF + 速率限制 + Bot 管理。
5. 分布式限流（Redis/网关）替代单进程限流。

### E. 基础设施与可用性
1. 多环境隔离（dev/staging/prod）与独立密钥。
2. 观测：日志、指标、链上事件告警、错误追踪。
3. 灾备：快照备份、跨区恢复、RTO/RPO 目标。
4. 发布策略：灰度发布 + 自动回滚。

### F. 合规与法律
1. 明确服务司法辖区与用户地区策略。
2. KYC/KYB、制裁筛查、AML 流程落地。
3. 交易与账务留存策略（审计追溯）。
4. 用户协议、风险披露、隐私政策发布。

### G. 运行门禁（必须通过）
```bash
npm run verify:p3a-freeze
npm run verify:p4b-audit-prep
npm run verify:p4c-security-review
npm run verify:p4e-audit-execution
npm run verify:p4f-closure
npm run security:sla:check
npm run release:block:check
npm test
npm run test:contracts
```

### H. 当前你们尚未完成的真实环境关键项
1. 外部审计真实执行（在跑流程但尚未完成结果闭环）。
2. 链上 Market 执行合约 MVP（当前主要为服务层市场逻辑）。
3. 真实 Crypto 充值/提现通道（目前未接入生产清结算）。
4. 分布式限流与边缘策略产品化。
5. 前端管理台与语义检索产品化。

## English

> Goal: move from a manually testable system to a real-value production system.

### A. Contracts and protocol
1. Freeze mainnet release artifacts (tag + commit + bytecode hash).
2. Complete external audit with zero Critical/High or signed accepted risks.
3. Minimize privileged roles (multisig + timelock for owner/registrar/minter).
4. Define upgrade and rollback path (including emergency pause policy).

### B. Wallets and keys
1. Move production keys to KMS/HSM/MPC (no plaintext keys).
2. Signature tiering: hot-wallet limits and cold-wallet custody.
3. Complete key-rotation and revocation drills.
4. Separate treasury and operations wallets.

### C. Real crypto top-up / withdrawal (on-ramp/off-ramp)
1. Start with a single supported asset (e.g., USDC on Base).
2. Integrate custody/settlement rails (exchange enterprise account, payment rail, or custodian).
3. Define top-up confirmation rules: confirmations, min amount, settlement SLA.
4. Define withdrawal controls: address whitelist, daily caps, manual review thresholds.
5. Build reconciliation: on-chain transfers vs internal ledger.
6. Define fee policy: gas budget, subsidies, retry/failure handling.

### D. Auth and abuse resistance
1. Enable both `API_AUTH_BEARER_TOKEN` and `API_AUTH_HMAC_SECRET`.
2. API key lifecycle: issue, expiry, revoke, quota.
3. Replay window control (`API_AUTH_HMAC_WINDOW_MS`) and request tracing.
4. Edge protection: Cloudflare WAF + rate limiting + bot controls.
5. Replace process-local limiter with distributed limiter (gateway/redis).

### E. Infra and availability
1. Isolated dev/staging/prod environments with independent credentials.
2. Observability: logs, metrics, chain-event alerting, error tracking.
3. DR: backups, multi-zone recovery, explicit RTO/RPO targets.
4. Release policy: canary rollout + auto rollback.

### F. Compliance and legal
1. Define jurisdiction and user-region access policy.
2. Operationalize KYC/KYB, sanctions screening, AML controls.
3. Retain transaction/accounting records for auditability.
4. Publish terms, risk disclosure, and privacy policy.

### G. Mandatory release gates
```bash
npm run verify:p3a-freeze
npm run verify:p4b-audit-prep
npm run verify:p4c-security-review
npm run verify:p4e-audit-execution
npm run verify:p4f-closure
npm run security:sla:check
npm run release:block:check
npm test
npm run test:contracts
```

### H. Remaining high-priority gaps in your current stack
1. External audit execution not yet fully closed.
2. On-chain market execution contract MVP not finished.
3. Real crypto top-up/withdraw rail not integrated.
4. Distributed rate limiting and edge hardening not productized.
5. Human-facing web console and semantic search not productized.
