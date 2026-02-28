# ELO Technical Overview / ELO 技术说明

## 1) Project Purpose / 项目目的

### 中文
ELO 是一个面向 AI Agent 经济体的开源结算协议。它解决的问题是：
- Agent 之间交易频率高、金额小、决策快；
- 直接使用法币或稳定币结算，流程复杂且摩擦高；
- 需要同时支持“同归属免费协作”和“跨归属真实付费流通”。

### English
ELO is an open-source settlement protocol for AI agent economies.
It addresses:
- high-frequency, low-value, autonomous agent transactions,
- friction of direct fiat/stablecoin settlement for each action,
- dual-mode settlement: free intra-owner calls and paid cross-owner trades.

## 2) Core Protocol Invariants / 核心协议不变量

### 中文
1. `same_owner_free`: 同归属 Agent 调用必须免费。
2. `cross_owner_paid`: 跨归属调用必须付费（除非显式赞助策略）。
3. `human_only_on_ramp_off-ramp`: 人类仅在充值/提现环节介入。

### English
1. `same_owner_free`: Same-owner calls must be free.
2. `cross_owner_paid`: Cross-owner calls must be billable (unless explicitly sponsored).
3. `human_only_on_ramp_off-ramp`: Humans interact only at recharge/withdraw boundaries.

## 3) Architecture / 架构

### 中文
- `OwnerRegistry.sol`: Agent 与 Owner 映射；支持 registrar 角色控制。
- `ELOToken.sol`: ELO 代币；支持 minter 角色控制。
- `SettlementEngine.sol`: 结算引擎，执行免费/付费分流，并支持可插拔 `IRiskPolicy`。
- `ThresholdRiskPolicy.sol`: 开源示例风控策略（阈值/封禁）。
- `src/settlementEngine.js`: 本地模拟引擎（产品规则验证）。
- `src/apiServer.js`: REST 原型接口层。

### English
- `OwnerRegistry.sol`: Agent-owner mapping with registrar access control.
- `ELOToken.sol`: ELO token with minter access control.
- `SettlementEngine.sol`: Settlement logic for free/paid routing with pluggable `IRiskPolicy`.
- `ThresholdRiskPolicy.sol`: open reference risk policy (threshold/blocklist).
- `src/settlementEngine.js`: local simulation engine for rapid validation.
- `src/apiServer.js`: REST prototype layer.

## 4) Security Model / 安全模型

### 中文
已实现安全控制：
- 角色控制：仅 registrar 可注册 Agent，仅 minter 可增发 ELO。
- 反盗刷：仅 `consumer` 可发起自身消费结算。
- 防重放：`requestId` 必须唯一，重复请求拒绝。
- 风控插件钩子：`validateSettlement` + `recordSettlement`，支持私有策略状态化控制（如频率窗口）。

待增强项：
- 基于签名的委托结算（relayer / meta-tx）；
- 更细粒度的速率限制与风控策略；
- 第三方安全审计。

### English
Implemented controls:
- Role control: only registrar can register agents, only minter can mint ELO.
- Anti-drain: only the `consumer` can initiate spending settlement.
- Replay protection: `requestId` must be unique.
- Risk plugin hooks: `validateSettlement` + `recordSettlement` for stateful private policy controls (e.g. rate windows).

Pending hardening:
- signature-based delegated settlement (relayer/meta-tx),
- rate-limiting and policy controls,
- third-party security audit.

## 5) Pricing Model / 定价模型

### 中文
跨归属结算价格建议模型：
`price = base_cost × market_multiplier × reputation_factor ± outcome_bonus`

### English
Recommended cross-owner pricing model:
`price = base_cost × market_multiplier × reputation_factor ± outcome_bonus`

## 6) Testing Strategy / 测试策略

### 中文
- Node 层：业务规则单测与 API 测试。
- Foundry 层：
  - 单元测试（权限、同/跨归属、重放、攻击路径）；
  - Fuzz 测试（大规模随机金额与调用序列）；
  - Invariant 测试（总量守恒、同归属不转账等）。

### English
- Node layer: business-rule unit tests + API tests.
- Foundry layer:
  - Unit tests (roles, free/paid paths, replay, attack path),
  - Fuzz tests (randomized amounts and sequences),
  - Invariant tests (supply conservation, no transfer for same-owner calls).

## 7) Current Status / 当前状态

### 中文
- 已完成：协议草案、模拟器、API 原型、合约骨架、极限测试首批。
- 进行中：链上 MVP 功能拓展（签名委托、更完整结算策略）。

### English
- Done: spec draft, simulator, API prototype, contract skeleton, first extreme test batch.
- In progress: on-chain MVP expansion (delegated signing, richer settlement policies).
