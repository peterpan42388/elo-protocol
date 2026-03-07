# Risk Matrix (ZH/EN)

## 中文

评分定义：
- 影响（Impact）：1-5
- 可能性（Likelihood）：1-5
- 风险分（Score）= Impact * Likelihood

| ID | 风险 | 影响 | 可能性 | 分数 | 当前控制 | 后续动作 |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | 请求洪泛导致 API 降级 | 4 | 3 | 12 | 进程内限流 + body 限制 | 接入网关/WAF 全局限流 |
| R2 | 非法输入污染状态（NaN/异常字符） | 4 | 2 | 8 | 统一输入校验 | 增加 schema 运行时强校验 |
| R3 | 重放结算请求 | 5 | 1 | 5 | `requestId` 去重 | 引入签名 nonce 范式 |
| R4 | 评价/评估刷分 | 4 | 3 | 12 | usageReceipt 绑定 + 去重 | anti-sybil + 权重衰减 |
| R5 | ACP 托管状态绕过 | 4 | 2 | 8 | 状态机 + 过期约束 | 合约化 escrow |
| R6 | x402 challenge 重复结算 | 3 | 2 | 6 | paymentId 状态去重 | 统一幂等键与审计追踪 |
| R7 | 横向扩容时限流失效 | 3 | 4 | 12 | 当前仅进程内限流 | Redis/edge 分布式限流 |
| R8 | 缺少强鉴权导致匿名滥用 | 5 | 3 | 15 | 可选 Bearer 鉴权（`API_AUTH_BEARER_TOKEN`） | API key/签名认证层 |

高优先级（分数 >= 12）：R1, R4, R7, R8。

## English

Scoring:
- Impact: 1-5
- Likelihood: 1-5
- Score = Impact * Likelihood

| ID | Risk | Impact | Likelihood | Score | Current controls | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | API degradation by request flooding | 4 | 3 | 12 | in-memory rate limit + body guard | edge/WAF global limiter |
| R2 | state pollution via invalid inputs | 4 | 2 | 8 | unified input guards | runtime schema enforcement |
| R3 | settlement replay | 5 | 1 | 5 | `requestId` dedupe | signature+nonce model |
| R4 | review/evaluation gaming | 4 | 3 | 12 | usage receipt binding + dedupe | anti-sybil + decay weighting |
| R5 | ACP escrow state bypass | 4 | 2 | 8 | state machine + expiry | on-chain escrow |
| R6 | repeated x402 settlement | 3 | 2 | 6 | paymentId state dedupe | unified idempotency tracing |
| R7 | limiter bypass in scaled deployment | 3 | 4 | 12 | process-local limiter only | distributed limiter (redis/edge) |
| R8 | anonymous abuse without strong auth | 5 | 3 | 15 | optional Bearer auth (`API_AUTH_BEARER_TOKEN`) | API key/signature authentication |

High-priority (score >= 12): R1, R4, R7, R8.
