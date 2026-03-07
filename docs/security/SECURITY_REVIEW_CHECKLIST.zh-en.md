# Security Review Checklist (ZH/EN)

## 中文

### A. 协议与不变量
- [ ] `same_owner_free` 与 `cross_owner_paid` 在所有入口保持一致。
- [ ] `requestId` 重放保护覆盖所有结算路径。
- [ ] x402/acp 流程不会绕过结算核心。

### B. 输入与边界
- [ ] 关键 ID 字段长度、字符集、空值检查通过。
- [ ] 数值字段拒绝 NaN/Infinity/负值越界。
- [ ] POST 接口仅接受 `application/json`。
- [ ] 请求体超限返回 `413`。

### C. 状态机与幂等
- [ ] x402 payment 状态仅允许合法迁移：`pending -> settled/expired`。
- [ ] ACP escrow 状态仅允许合法迁移：`awaiting_fund -> funded -> executed`。
- [ ] review/evaluation 对 usage receipt 的去重有效。

### D. 可用性与滥用防护
- [ ] 限流阈值配置已设置并验证（429）。
- [ ] 高频调用下不会出现内存泄漏或明显性能退化。
- [ ] 关键热路径存在上限（分页 limit、TTL 等）。

### E. 可观测性与发布
- [ ] 关键失败路径有可检索日志（至少含 requestId/paymentId/escrowId）。
- [ ] `npm test`, `test:contracts`, `policy:check` 全绿。
- [ ] 审计准备文档已更新（threat/risk/checklist/regression）。

## English

### A. Protocol and invariants
- [ ] `same_owner_free` and `cross_owner_paid` remain consistent across all entry points.
- [ ] `requestId` replay protection covers all settlement paths.
- [ ] x402/acp paths cannot bypass settlement core.

### B. Input and boundaries
- [ ] Critical IDs are validated for length, charset, and non-empty values.
- [ ] Numeric fields reject NaN/Infinity/out-of-range values.
- [ ] POST endpoints enforce `application/json`.
- [ ] Oversized payloads return `413`.

### C. State machine and idempotency
- [ ] x402 states only allow valid transitions: `pending -> settled/expired`.
- [ ] ACP escrow states only allow valid transitions: `awaiting_fund -> funded -> executed`.
- [ ] review/evaluation dedupe on usage receipt is effective.

### D. Availability and abuse resistance
- [ ] Rate-limit thresholds are configured and validated (`429`).
- [ ] No obvious memory leaks/perf regressions under burst traffic.
- [ ] Hot paths enforce bounded controls (pagination limits, TTL).

### E. Observability and release
- [ ] Key failure paths are traceable with identifiers (requestId/paymentId/escrowId).
- [ ] `npm test`, `test:contracts`, and `policy:check` all pass.
- [ ] Audit-prep docs are updated (threat/risk/checklist/regression).
