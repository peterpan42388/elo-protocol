# ELO Market Execution Plan (ZH/EN)

## 中文

### 背景
ELO 将作为 AI 市场（ELO Market）的结算核心。目标不是在 ELO 协议中塞入全部业务逻辑，而是保持 ELO 核心“通用+简洁”，市场能力通过上层模块扩展。

### 设计原则
1. 协议内核稳定：保留 `same_owner_free` / `cross_owner_paid` 不变量。
2. 市场逻辑外置：商品发现、匹配、推荐放在上层市场模块。
3. 脚本化验证优先：先在本地进行可重复的虚拟钱包与场景测试。

### 本次已落地
1. 虚拟钱包与测试资金注入：`scripts/bootstrap-virtual-wallets.sh`
2. P0/P2 场景测试：`tests/eloMarket.p0-p2.test.js`
3. 市场最小模块：`src/eloMarket.js`（发布/报价/购买/节省模拟）
4. API 脚手架（P3前置）：
   - `POST /market/offers/publish`
   - `GET /market/offers`
   - `POST /market/quote`
   - `POST /market/purchase`
   - `POST /market/savings-simulate`
5. Dashboard 契约（P3最小闭环）：
   - `GET /dashboard/schema`
   - `GET /dashboard/summary`
   - `GET /dashboard/agents`
   - `GET /dashboard/offers`
   - `GET /dashboard/trades?limit=100`
   - `GET /dashboard/savings`
   - 契约文档：`docs/DASHBOARD_API_CONTRACT.v1.zh-en.md`
6. P3-A 架构冻结包：
   - `docs/architecture/P3A_ARCHITECTURE_FREEZE.zh-en.md`
   - `docs/architecture/adr/*`
   - `docs/schemas/listing.v1.json`
   - `docs/schemas/review.v1.json`
   - `docs/schemas/event.v1.json`
   - `docs/schemas/query.dsl.v1.json`
7. P3-B 检索与评价基础：
   - `POST /market/search`（query.dsl.v1）
   - 复合过滤 + 混合排序（相关度/评级/节省率/价格）
   - `POST /market/reviews/submit`（要求 usageReceiptRef）
8. P3-C 结果评估基础：
   - `POST /market/evaluations/submit`（要求 usageReceiptRef + baselineAmount）
   - `GET /market/outcomes/listing/{listingId}`
   - `GET /market/outcomes/provider/{ownerId}`
   - 检索排序新增 `sort.mode=outcome`
9. P3-D x402 适配基础：
   - `POST /market/x402/challenge`（跨归属返回 402 支付挑战）
   - `POST /market/x402/settle`（支付确认后执行结算）
   - `GET /market/x402/payments/{paymentId}`（支付状态追踪）
10. P3-E ACP 协商与托管基础（soft escrow）：
   - `POST /market/acp/intents/open`
   - `POST /market/acp/intents/{intentId}/accept`
   - `POST /market/acp/escrow/{escrowId}/fund`
   - `POST /market/acp/escrow/{escrowId}/execute`
11. P3-F Dashboard 扩展分析：
   - `GET /dashboard/market-efficiency`（市场效率聚合）
   - `GET /dashboard/outcomes`（结果评分与 bonus 聚合）
12. P4-A 安全加固基线：
   - API 限流（429）
   - 请求体大小上限（413）
   - POST JSON content-type 强校验（415）
   - 关键 ID/数值输入校验
13. P4-B 审计准备基线：
   - 威胁模型（Threat Model）
   - 风险矩阵（Risk Matrix）
   - 安全审查检查清单（Checklist）
   - 安全回归策略与门禁（Regression Gates）

### 运行方式
```bash
npm run wallet:virtual
npm run test:p0p2:local
npm run demo:market
npm test
```

### 待补资料/问题
1. ELO Market 的商品标准（skill/API/data 的统一元数据 schema）
2. 交易后评估标准（节省率、命中率、延迟）
3. P3 Web Dashboard 的最小字段集（你回来后可确认）

### 组件蓝图（你给出的版本，补充当前状态）
| 组件 | 描述 | 技术栈 | 如何支持节省 token | 当前状态 |
| --- | --- | --- | --- | --- |
| ELO Core | 结算逻辑：免费内部、付费跨界；可扩展 x402 | Solidity, Foundry | 内部免费调用避免重复结算 | 已完成核心规则与测试；x402 待接入 |
| Discovery Market | 产品目录 + 匹配：代理搜索/购买 API/skill | GraphQL, Semantic Search | 复用 skill 减少 LLM 调用 | 已有最小目录（offer publish/list）；GraphQL/语义检索待接入 |
| Transaction Engine | 即时 ELO 交易；竞标机制 | Smart Contracts, Oracle | 自动优化定价，节省计算 | 已有即时结算与报价；竞标/链上 oracle 待接入 |
| Human Web App | Dashboard：监控、充值、模拟测试 | React, Node.js | 人类分析 token 效率报告 | 已冻结 Dashboard API v1，并完成 market/outcomes 分析扩展；React 页面待实现 |
| Governance DAO | 投票升级；声誉系统 | Snapshot/Aragon | 惩罚低效代理，优化生态 | 规划中 |
| Risk & Analytics | 审计日志、性能热图 | Chainlink Functions | 实时追踪节省，警报浪费 | 已有基础日志/风控插件；热图与链上分析待接入 |

## English

### Context
ELO serves as the settlement core for ELO Market. The goal is to keep ELO protocol generic and simple, while market features are layered on top.

### Design principles
1. Stable protocol core: preserve `same_owner_free` / `cross_owner_paid` invariants.
2. Externalize market logic: discovery, matching, recommendation live in upper layers.
3. Script-first validation: reproducible virtual-wallet and local scenario testing.

### Delivered in this iteration
1. Virtual wallet + local funding script: `scripts/bootstrap-virtual-wallets.sh`
2. P0/P2 scenario tests: `tests/eloMarket.p0-p2.test.js`
3. Minimal market module: `src/eloMarket.js` (publish/quote/purchase/savings simulation)
4. API scaffold for P3 preparation:
   - `POST /market/offers/publish`
   - `GET /market/offers`
   - `POST /market/quote`
   - `POST /market/purchase`
   - `POST /market/savings-simulate`
5. Dashboard contract for P3 minimum loop:
   - `GET /dashboard/schema`
   - `GET /dashboard/summary`
   - `GET /dashboard/agents`
   - `GET /dashboard/offers`
   - `GET /dashboard/trades?limit=100`
   - `GET /dashboard/savings`
   - contract doc: `docs/DASHBOARD_API_CONTRACT.v1.zh-en.md`
6. P3-A architecture freeze pack:
   - `docs/architecture/P3A_ARCHITECTURE_FREEZE.zh-en.md`
   - `docs/architecture/adr/*`
   - `docs/schemas/listing.v1.json`
   - `docs/schemas/review.v1.json`
   - `docs/schemas/event.v1.json`
   - `docs/schemas/query.dsl.v1.json`
7. P3-B search/review baseline:
   - `POST /market/search` (query.dsl.v1)
   - composite filtering + hybrid ranking (relevance/rating/saving/price)
   - `POST /market/reviews/submit` with required `usageReceiptRef`
8. P3-C outcome evaluator baseline:
   - `POST /market/evaluations/submit` (usageReceiptRef + baselineAmount required)
   - `GET /market/outcomes/listing/{listingId}`
   - `GET /market/outcomes/provider/{ownerId}`
   - search ranking supports `sort.mode=outcome`
9. P3-D x402 adapter baseline:
   - `POST /market/x402/challenge` (cross-owner returns 402 challenge)
   - `POST /market/x402/settle` (finalize settlement after payment)
   - `GET /market/x402/payments/{paymentId}` (payment state tracking)
10. P3-E ACP negotiation + escrow baseline (soft escrow):
   - `POST /market/acp/intents/open`
   - `POST /market/acp/intents/{intentId}/accept`
   - `POST /market/acp/escrow/{escrowId}/fund`
   - `POST /market/acp/escrow/{escrowId}/execute`
11. P3-F dashboard analytics extension:
   - `GET /dashboard/market-efficiency` (market efficiency aggregates)
   - `GET /dashboard/outcomes` (outcome score and bonus aggregates)
12. P4-A security hardening baseline:
   - API rate limiting (`429`)
   - request body size guard (`413`)
   - POST JSON content-type enforcement (`415`)
   - strict validation for critical IDs and numeric fields
13. P4-B audit-prep baseline:
   - threat model
   - risk matrix
   - security review checklist
   - security regression strategy and gates

### How to run
```bash
npm run wallet:virtual
npm run test:p0p2:local
npm run demo:market
npm test
```

### Pending inputs/questions
1. Unified product schema for skill/API/data listings
2. Post-trade evaluator KPI extension (accuracy, freshness, retry cost)
3. Minimum field set for P3 web dashboard (to confirm later)

### Component blueprint (your version, with current status)
| Component | Description | Tech stack | How it saves tokens | Current status |
| --- | --- | --- | --- | --- |
| ELO Core | Settlement logic: same-owner free, cross-owner paid; x402-extensible | Solidity, Foundry | Avoids duplicate internal settlement calls | Core invariants and tests done; x402 integration pending |
| Discovery Market | Product catalog + matching for API/skill purchase | GraphQL, Semantic Search | Skill reuse reduces repeated LLM calls | Minimal offer catalog exists; GraphQL/semantic search pending |
| Transaction Engine | Instant ELO trades; auction/bidding mechanism | Smart Contracts, Oracle | Better price optimization lowers compute spend | Instant quote/settlement done; bidding/oracle integration pending |
| Human Web App | Dashboard for monitoring, top-up, simulation | React, Node.js | Human-visible token efficiency analysis | Dashboard API v1 frozen, with market/outcomes analytics extension delivered; React UI pending |
| Governance DAO | Upgrade voting and reputation governance | Snapshot/Aragon | Penalizes low-efficiency behavior | Planned |
| Risk & Analytics | Audit logs and performance heatmaps | Chainlink Functions | Tracks savings and alerts waste in real time | Base logging/risk hooks done; heatmap/on-chain analytics pending |
