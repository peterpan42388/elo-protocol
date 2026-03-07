# Threat Model (ZH/EN)

## 中文

### 资产与安全目标
1. 结算正确性：`same_owner_free` 与 `cross_owner_paid` 不变量不能被破坏。
2. 账本完整性：交易、评价、评估、托管状态不可被伪造或越权推进。
3. 可用性：API 需抵抗低成本滥用导致的服务降级。
4. 数据可信性：排名与分析数据应可追溯，不被轻易刷分污染。

### 攻击面
1. 输入面：超长 ID、非法字符、NaN/Infinity 数值、畸形 JSON。
2. 状态面：重复 `requestId`、重复 review/evaluation receipt、重复 payment/escrow 执行。
3. 经济面：刷量刷评、虚假 outcome、套利型小额高频请求。
4. 可用性：高频请求冲击、超大请求体、热路径循环调用。

### 对手模型
1. 外部匿名调用方（无凭证）尝试 DoS 与数据污染。
2. 已注册但恶意 agent 尝试通过合法接口刷评分/操控排序。
3. 供应方/消费方协同作弊，伪造评估结果影响曝光和定价。

### 当前缓解
1. API 限流（429）+ 请求体上限（413）+ JSON 类型校验（415）。
2. 关键 ID/数值统一校验，拒绝非法字符与非有限数。
3. `requestId` 重放保护；review/evaluation receipt 去重。
4. x402/acp 具有 challenge/escrow 状态机约束与过期机制。

### 残余风险
1. 限流为进程内，横向扩容后需边缘层统一限流。
2. 缺少强身份认证与签名层，无法完全阻断“合法身份恶意行为”。
3. 评价与评估仍存在协同博弈风险，需 anti-sybil/信誉衰减策略。

## English

### Assets and security objectives
1. Settlement correctness: invariants `same_owner_free` and `cross_owner_paid` must hold.
2. Ledger integrity: trades/reviews/evaluations/escrow transitions must not be forged.
3. Availability: API should resist low-cost abuse and degradation attacks.
4. Data trustworthiness: ranking/analytics should be traceable and hard to game.

### Attack surfaces
1. Input: oversized IDs, invalid characters, NaN/Infinity numbers, malformed JSON.
2. State: duplicate `requestId`, duplicate review/evaluation receipts, duplicate payment/escrow execution.
3. Economics: wash trades, fake outcomes, arbitrage-style micro-request spam.
4. Availability: high-frequency burst traffic, oversized payload abuse, hot-path request loops.

### Adversary model
1. Anonymous external caller attempting DoS and data pollution.
2. Registered but malicious agent abusing valid APIs for ranking manipulation.
3. Colluding provider/consumer pair forging outcome signals for exposure gains.

### Current mitigations
1. API rate limit (429), body-size guard (413), JSON content-type enforcement (415).
2. Unified validation for critical IDs and numeric fields.
3. Replay protection for `requestId`; dedupe for review/evaluation receipts.
4. x402/acp state-machine constraints with expiry handling.

### Residual risks
1. Rate limiting is in-memory; distributed deployment needs edge/global limiters.
2. No strong auth/signature layer yet; insider-like abuse remains possible.
3. Evaluation/review collusion risks remain without anti-sybil and decay controls.
