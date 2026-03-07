# Security Regression Strategy (ZH/EN)

## 中文

### 目标
将安全相关变更纳入固定回归门禁，避免“功能通过但安全退化”。

### 最小门禁（每次 PR）
1. `npm test`
2. `npm run test:contracts`
3. `npm run policy:check`
4. `npm run verify:p3a-freeze`
5. `npm run verify:p4b-audit-prep`

### 安全回归重点
1. API 防护：429/413/415 行为稳定。
2. 输入校验：关键 token/number 校验不可被回退。
3. 状态机幂等：x402/acp 的重复执行与过期逻辑稳定。
4. 协议不变量：结算路径不破坏免费/付费分流。

### 发布前检查
1. 变更说明是否列出安全影响面。
2. 文档是否同步（SECURITY、API、USER_GUIDE）。
3. 高优先级风险（R1/R4/R7/R8）是否新增暴露面。

## English

### Goal
Make security behavior a mandatory regression gate so functional passes cannot hide security regressions.

### Minimum gates (per PR)
1. `npm test`
2. `npm run test:contracts`
3. `npm run policy:check`
4. `npm run verify:p3a-freeze`
5. `npm run verify:p4b-audit-prep`

### Security regression focus
1. API controls: stable behavior for 429/413/415.
2. Input guards: critical token/number validations remain enforced.
3. State-machine idempotency: x402/acp duplicate and expiry handling remains correct.
4. Protocol invariants: no breakage in free-vs-paid settlement routing.

### Pre-release checks
1. Security impact is explicitly stated in change notes.
2. Docs are synchronized (SECURITY/API/USER_GUIDE).
3. High-priority risks (R1/R4/R7/R8) are reassessed for new exposure.
