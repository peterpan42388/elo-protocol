# P3-A Architecture Freeze (ZH/EN)

## 中文

### 1. 目标
在功能继续扩展前，冻结 ELO Protocol 与 ELO Market 的系统边界、事件链、数据契约和阶段门禁，防止后续耦合失控。

### 2. 分层边界（冻结）
- L0 Protocol Layer（ELO Protocol）
  - 职责：结算不变量、账户归属、风控钩子。
  - 禁止：检索/推荐/商品目录逻辑。
- L1 Market Domain Layer（ELO Market Core）
  - 职责：商品目录、检索、交易编排、评价、评级。
  - 依赖：调用 L0 完成结算。
- L2 Service/API Layer
  - 职责：对外 API（Market + Dashboard），字段兼容策略。
- L3 Experience Layer
  - 职责：Web/Agent SDK 接入，不反向侵入领域模型。

### 3. 交易与评价事件链（冻结）
`SearchRequested -> QuoteCreated -> OrderCreated -> ExecutionStarted -> ExecutionSucceeded|ExecutionFailed -> SettlementSucceeded|SettlementFailed -> ReviewSubmitted -> RatingUpdated -> RankUpdated`

约束：
1. `ExecutionSucceeded` 才允许触发结算。
2. `SettlementSucceeded` 后才允许产生有效评价。
3. 免费商品（price=0）也必须产出 `usage_receipt` 才可评价。

### 4. 核心数据契约（冻结）
- `docs/schemas/listing.v1.json`
- `docs/schemas/review.v1.json`
- `docs/schemas/event.v1.json`
- `docs/schemas/query.dsl.v1.json`

兼容策略：
1. v1 字段只增不改。
2. 破坏性变更必须升 v2。

### 5. 阶段门禁（冻结）
- P3-A：架构与契约冻结（本文件 + ADR + schema）
- P3-B：复合检索可用（过滤 + 语义 + 重排）
- P3-C：开源免费货源池与质量门禁
- P3-D：评价/评级联动并接入排序
- P3-E：执行编排器稳定化（重试/超时/回执）

### 6. 当前仓库映射
- L0：`contracts/*`
- L1：`src/eloMarket.js`
- L2：`src/apiServer.js`, `src/dashboardContract.js`
- L2 契约：`docs/DASHBOARD_API_CONTRACT.v1.zh-en.md`

### 7. 变更流程
任何涉及边界与契约的改动，必须先提交 ADR，再改代码。

## English

### 1. Goal
Freeze boundaries, event flow, data contracts, and stage gates before further feature expansion.

### 2. Layer boundaries (frozen)
- L0 Protocol Layer (ELO Protocol)
  - Responsibility: settlement invariants, ownership mapping, risk hooks.
  - Forbidden: discovery/recommendation/catalog logic.
- L1 Market Domain Layer (ELO Market Core)
  - Responsibility: catalog, search, transaction orchestration, review, rating.
  - Dependency: invokes L0 for settlement.
- L2 Service/API Layer
  - Responsibility: external API surface and compatibility policy.
- L3 Experience Layer
  - Responsibility: Web/Agent SDK integration only.

### 3. Frozen event flow
`SearchRequested -> QuoteCreated -> OrderCreated -> ExecutionStarted -> ExecutionSucceeded|ExecutionFailed -> SettlementSucceeded|SettlementFailed -> ReviewSubmitted -> RatingUpdated -> RankUpdated`

Constraints:
1. Settlement is allowed only after `ExecutionSucceeded`.
2. Valid reviews are allowed only after `SettlementSucceeded`.
3. Free listings (`price=0`) still require `usage_receipt` to unlock reviews.

### 4. Frozen data contracts
- `docs/schemas/listing.v1.json`
- `docs/schemas/review.v1.json`
- `docs/schemas/event.v1.json`
- `docs/schemas/query.dsl.v1.json`

Compatibility policy:
1. v1 is additive-only.
2. Breaking changes require v2.

### 5. Stage gates (frozen)
- P3-A: architecture and contract freeze
- P3-B: composite search availability
- P3-C: open-source free inventory + quality gate
- P3-D: review/rating linked to ranking
- P3-E: execution orchestrator hardening

### 6. Repository mapping
- L0: `contracts/*`
- L1: `src/eloMarket.js`
- L2: `src/apiServer.js`, `src/dashboardContract.js`
- L2 contract: `docs/DASHBOARD_API_CONTRACT.v1.zh-en.md`

### 7. Change process
Boundary/contract changes must start with ADR updates before code changes.
