# P4-C Security Review Drill Report (ZH/EN)

## 中文

### 审查范围
- `src/apiServer.js`
- `src/x402Adapter.js`
- `src/acpAdapter.js`
- `src/settlementEngine.js`
- `src/eloMarket.js`

### 方法
1. 面向攻击面的代码走查（输入、状态机、可用性）。
2. 针对关键路径设计回归测试并验证。
3. 将发现按风险级别分组，并立即修复高优先级项。

### 主要发现与处置

#### F1（高）限流状态表可能被高基数客户端压爆
- 风险：攻击者使用大量伪造来源键导致内存增长。
- 处置：新增 `API_RATE_LIMIT_MAX_CLIENTS`，超过容量时拒绝新 key（429）。
- 结果：已修复并有测试覆盖（`apiServer.security.test.js`）。

#### F2（中）x402 pending/settled 状态可能无界增长
- 风险：大量 challenge/receipt 可造成内存压力。
- 处置：新增容量上限与清理机制：
  - `maxPendingPayments`
  - `maxSettledPayments`
  - 过期 pending 自动清理
- 结果：已修复并有测试覆盖（`x402Adapter.test.js`）。

#### F3（中）ACP intent/escrow 状态可能无界增长
- 风险：长期运行下状态累积导致资源占用。
- 处置：新增容量和保留期策略：
  - `maxIntents`
  - `maxEscrows`
  - `terminalRetentionMs`
  - 过期与终态清理
- 结果：已修复并有测试覆盖（`acpAdapter.test.js`）。

### 本轮新增防护
- API 限流客户端上限控制。
- x402/ACP 状态存储上限和清理回收。
- 安全回归测试扩展（限流容量、队列容量、清理路径）。

### 残余风险
1. 限流与状态存储仍为单进程内存模型，分布式部署需外部组件（Redis/网关）。
2. 鉴权/签名层未引入，匿名滥用风险仍在。
3. 协同刷分问题需 anti-sybil 与信誉衰减机制进一步处理。

## English

### Review scope
- `src/apiServer.js`
- `src/x402Adapter.js`
- `src/acpAdapter.js`
- `src/settlementEngine.js`
- `src/eloMarket.js`

### Method
1. Attack-surface-oriented code review (inputs, state machines, availability).
2. Add focused regression tests for critical paths.
3. Group findings by severity and remediate high-priority items immediately.

### Key findings and actions

#### F1 (High) limiter bucket growth under high-cardinality clients
- Risk: memory pressure from many synthetic client keys.
- Action: add `API_RATE_LIMIT_MAX_CLIENTS`; reject new keys when cap is reached (`429`).
- Result: fixed with test coverage (`apiServer.security.test.js`).

#### F2 (Medium) unbounded x402 pending/settled state growth
- Risk: challenge/receipt accumulation can exhaust memory.
- Action: add bounded queues and cleanup:
  - `maxPendingPayments`
  - `maxSettledPayments`
  - automatic expiry cleanup for pending entries
- Result: fixed with test coverage (`x402Adapter.test.js`).

#### F3 (Medium) unbounded ACP intent/escrow state growth
- Risk: long-running node accumulates state.
- Action: add retention and capacity controls:
  - `maxIntents`
  - `maxEscrows`
  - `terminalRetentionMs`
  - cleanup for expired/terminal entries
- Result: fixed with test coverage (`acpAdapter.test.js`).

### New protections added in this drill
- Limiter tracked-client cap.
- Bounded x402/ACP state stores with cleanup.
- Extended security regression tests for caps and cleanup paths.

### Residual risks
1. Limiting/state are still process-local; distributed deployments need externalized controls.
2. Auth/signature layer is not yet in place; anonymous abuse remains possible.
3. Collusion/gaming still requires anti-sybil and reputation decay controls.
