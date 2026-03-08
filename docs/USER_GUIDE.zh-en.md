# ELO User Guide / ELO 使用文档

## 1) Prerequisites / 前置条件

### 中文
- Node.js 22+
- npm 10+
- Foundry（`forge`）

### English
- Node.js 22+
- npm 10+
- Foundry (`forge`)

## 2) Install / 安装

```bash
npm install
```

安装 Foundry（如未安装）：
```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.zshenv
foundryup
```

## 3) Run Local Prototype / 运行本地原型

### 中文
1. 运行 JS 规则测试：
```bash
npm test
```
2. 运行模拟交易 demo：
```bash
npm run demo
```
3. 启动 REST API：
```bash
npm start
```
4. 生成虚拟钱包并注入测试资金（本地 anvil）：
```bash
npm run wallet:virtual
```
5. 运行 P0/P2 市场阶段测试：
```bash
npm run test:p0p2:local
```

### English
1. Run JS rule tests:
```bash
npm test
```
2. Run settlement demo:
```bash
npm run demo
```
3. Start REST API:
```bash
npm start
```
4. Generate virtual wallets and fund them (local anvil):
```bash
npm run wallet:virtual
```
5. Run P0/P2 market-phase tests:
```bash
npm run test:p0p2:local
```

## 4) API Endpoints / API 接口

### 中文
- `POST /register-agent`
- `POST /recharge`
- `POST /quote`
- `POST /settle`
- `GET /balance/{agentId}`
- `POST /market/offers/publish`
- `GET /market/offers`
- `POST /market/acp/intents/open`
- `POST /market/acp/intents/{intentId}/accept`
- `GET /market/acp/intents/{intentId}`
- `POST /market/acp/escrow/{escrowId}/fund`
- `POST /market/acp/escrow/{escrowId}/execute`
- `GET /market/acp/escrow/{escrowId}`
- `POST /market/x402/challenge`
- `POST /market/x402/settle`
- `GET /market/x402/payments/{paymentId}`
- `POST /market/search`
- `POST /market/quote`
- `POST /market/purchase`
- `POST /market/savings-simulate`
- `POST /market/reviews/submit`
- `GET /market/reviews`
- `GET /market/ratings/listing/{listingId}`
- `GET /market/ratings/provider/{ownerId}`
- `POST /market/evaluations/submit`
- `GET /market/evaluations`
- `GET /market/outcomes/listing/{listingId}`
- `GET /market/outcomes/provider/{ownerId}`
- `GET /dashboard/schema`
- `GET /dashboard/summary`
- `GET /dashboard/agents`
- `GET /dashboard/offers`
- `GET /dashboard/trades?limit=100`
- `GET /dashboard/savings`
- `GET /dashboard/market-efficiency?limit=20`
- `GET /dashboard/outcomes?limit=100`

`/settle` 必须提供唯一 `requestId`，否则会被拒绝。

### English
- `POST /register-agent`
- `POST /recharge`
- `POST /quote`
- `POST /settle`
- `GET /balance/{agentId}`
- `POST /market/offers/publish`
- `GET /market/offers`
- `POST /market/acp/intents/open`
- `POST /market/acp/intents/{intentId}/accept`
- `GET /market/acp/intents/{intentId}`
- `POST /market/acp/escrow/{escrowId}/fund`
- `POST /market/acp/escrow/{escrowId}/execute`
- `GET /market/acp/escrow/{escrowId}`
- `POST /market/x402/challenge`
- `POST /market/x402/settle`
- `GET /market/x402/payments/{paymentId}`
- `POST /market/search`
- `POST /market/quote`
- `POST /market/purchase`
- `POST /market/savings-simulate`
- `POST /market/reviews/submit`
- `GET /market/reviews`
- `GET /market/ratings/listing/{listingId}`
- `GET /market/ratings/provider/{ownerId}`
- `POST /market/evaluations/submit`
- `GET /market/evaluations`
- `GET /market/outcomes/listing/{listingId}`
- `GET /market/outcomes/provider/{ownerId}`
- `GET /dashboard/schema`
- `GET /dashboard/summary`
- `GET /dashboard/agents`
- `GET /dashboard/offers`
- `GET /dashboard/trades?limit=100`
- `GET /dashboard/savings`
- `GET /dashboard/market-efficiency?limit=20`
- `GET /dashboard/outcomes?limit=100`

`/settle` requires a unique `requestId`, otherwise request is rejected.

## 5) Contract Tests / 合约测试

### 中文
标准合约测试：
```bash
npm run test:contracts
```
极限合约测试（更详细输出）：
```bash
npm run test:contracts:extreme
```
说明：标准测试只覆盖核心结算合约路径，极限测试覆盖 fuzz + invariant。
审计准备工件校验：
```bash
npm run verify:p4b-audit-prep
```
安全审查报告工件校验：
```bash
npm run verify:p4c-security-review
```
外部审计执行包工件校验：
```bash
npm run verify:p4e-audit-execution
```
审计发现闭环工件校验：
```bash
npm run verify:p4f-closure
```
SLA 与发布阻断检查：
```bash
npm run security:sla:check
npm run release:block:check
```

### English
Standard contract tests:
```bash
npm run test:contracts
```
Extreme contract tests (verbose):
```bash
npm run test:contracts:extreme
```
Note: standard tests cover core settlement paths, while extreme tests cover fuzz + invariants.
Audit-prep artifact verification:
```bash
npm run verify:p4b-audit-prep
```
Security-review artifact verification:
```bash
npm run verify:p4c-security-review
```
External-audit execution pack verification:
```bash
npm run verify:p4e-audit-execution
```
Finding-closure artifact verification:
```bash
npm run verify:p4f-closure
```
SLA and release blocker checks:
```bash
npm run security:sla:check
npm run release:block:check
```

## 6) CI / 持续集成

### 中文
- `CI` 工作流：Node 测试 + Solidity 编译 + Foundry 核心合约测试（快速反馈）。
- `Extreme Contract Tests`：可手动触发，也可定时触发。

### English
- `CI` workflow: Node tests + Solidity compile + core Foundry contract tests (fast feedback).
- `Extreme Contract Tests`: manual and scheduled runs.

## 7) Known Gaps / 当前缺口

### 中文
- 还未实现链上签名委托结算（目前 consumer 自主发起）。
- 还未接入真实 oracle 定价与跨链桥。
- 还未完成外部审计。

### English
- Signature-based delegated settlement is not implemented yet (consumer-only trigger for now).
- Real oracle pricing and cross-chain bridge are not integrated yet.
- External audit not completed yet.

## 8) Deployment / 部署

### 中文
- 本地广播验证：`npm run deploy:local`
- Base Sepolia 部署：`npm run deploy:base-sepolia`
- 详细说明见：`docs/DEPLOYMENT_BASE_SEPOLIA.zh-en.md`

### English
- Local broadcast verification: `npm run deploy:local`
- Base Sepolia deployment: `npm run deploy:base-sepolia`
- Full guide: `docs/DEPLOYMENT_BASE_SEPOLIA.zh-en.md`

## 9) Security Baseline / 安全基线

### 中文
- POST 接口必须使用 `application/json`，否则返回 `415`。
- 设置 `API_AUTH_BEARER_TOKEN` 后，所有 POST 接口都需 `Authorization: Bearer <token>`，否则返回 `401`。
- 设置 `API_AUTH_HMAC_SECRET` 后，所有 POST 接口还需 HMAC 签名头（`X-ELO-Timestamp` + `X-ELO-Signature`），否则返回 `401`。
- 请求体超过阈值返回 `413`。
- 达到限流阈值返回 `429`。
- 可通过环境变量调整：
  - `API_RATE_LIMIT_MAX`（默认 `2000`）
  - `API_RATE_LIMIT_WINDOW_MS`（默认 `60000`）
  - `API_BODY_MAX_BYTES`（默认 `65536`）
  - `API_RATE_LIMIT_MAX_CLIENTS`（默认 `10000`）
  - `X402_DEFAULT_TTL_MS`（默认 `120000`）
  - `X402_MAX_PENDING`（默认 `5000`）
  - `X402_MAX_SETTLED`（默认 `10000`）
  - `ACP_DEFAULT_ESCROW_TTL_MS`（默认 `300000`）
  - `ACP_MAX_INTENTS`（默认 `5000`）
  - `ACP_MAX_ESCROWS`（默认 `5000`）
  - `ACP_TERMINAL_RETENTION_MS`（默认 `3600000`）
  - `API_AUTH_BEARER_TOKEN`（可选；设置后所有 POST 端点强制 Bearer 鉴权）
  - `API_AUTH_HMAC_SECRET`（可选；设置后所有 POST 端点强制 HMAC 签名鉴权）
  - `API_AUTH_HMAC_WINDOW_MS`（默认 `300000`）

### English
- POST endpoints require `application/json` (`415` otherwise).
- If `API_AUTH_BEARER_TOKEN` is set, all POST endpoints require `Authorization: Bearer <token>` (`401` otherwise).
- If `API_AUTH_HMAC_SECRET` is set, all POST endpoints also require HMAC headers (`X-ELO-Timestamp` and `X-ELO-Signature`) (`401` otherwise).
- Oversized request bodies return `413`.
- Rate-limit overflow returns `429`.
- Runtime env configs:
  - `API_RATE_LIMIT_MAX` (default `2000`)
  - `API_RATE_LIMIT_WINDOW_MS` (default `60000`)
  - `API_BODY_MAX_BYTES` (default `65536`)
  - `API_RATE_LIMIT_MAX_CLIENTS` (default `10000`)
  - `X402_DEFAULT_TTL_MS` (default `120000`)
  - `X402_MAX_PENDING` (default `5000`)
  - `X402_MAX_SETTLED` (default `10000`)
  - `ACP_DEFAULT_ESCROW_TTL_MS` (default `300000`)
  - `ACP_MAX_INTENTS` (default `5000`)
  - `ACP_MAX_ESCROWS` (default `5000`)
  - `ACP_TERMINAL_RETENTION_MS` (default `3600000`)
  - `API_AUTH_BEARER_TOKEN` (optional; enforces Bearer auth on all POST endpoints when set)
  - `API_AUTH_HMAC_SECRET` (optional; enforces HMAC auth on all POST endpoints when set)
  - `API_AUTH_HMAC_WINDOW_MS` (default `300000`)
