# P4-B Audit Prep Baseline (ZH/EN)

## 中文

### 目标
为外部安全审计建立可执行、可复查、可持续更新的准备基线，覆盖：
1. 威胁模型
2. 风险矩阵
3. 安全审查检查清单
4. 回归与发布门禁策略

### 交付物
- `docs/security/THREAT_MODEL.zh-en.md`
- `docs/security/RISK_MATRIX.zh-en.md`
- `docs/security/SECURITY_REVIEW_CHECKLIST.zh-en.md`
- `docs/security/REGRESSION_STRATEGY.zh-en.md`
- `scripts/verify-p4b-audit-prep.mjs`（审计准备文档存在性和关键段落校验）

### 范围边界
- 本阶段不替代第三方审计，不给出“已审计通过”结论。
- 本阶段输出的是审计输入资产与工程门禁，不是法律/合规意见。

### 审计对象（当前代码域）
- Settlement core：`src/settlementEngine.js`
- Market core：`src/eloMarket.js`
- x402 adapter：`src/x402Adapter.js`
- ACP adapter：`src/acpAdapter.js`
- API gateway：`src/apiServer.js`

## English

### Goal
Establish a concrete audit-prep baseline that is executable, reviewable, and maintainable, covering:
1. Threat model
2. Risk matrix
3. Security review checklist
4. Regression and release gating strategy

### Deliverables
- `docs/security/THREAT_MODEL.zh-en.md`
- `docs/security/RISK_MATRIX.zh-en.md`
- `docs/security/SECURITY_REVIEW_CHECKLIST.zh-en.md`
- `docs/security/REGRESSION_STRATEGY.zh-en.md`
- `scripts/verify-p4b-audit-prep.mjs` (artifact and key-section verification)

### Scope boundary
- This stage does not replace third-party security audit and does not claim "audited".
- This stage delivers audit input assets and engineering gates, not legal/compliance opinions.

### In-scope code domains
- Settlement core: `src/settlementEngine.js`
- Market core: `src/eloMarket.js`
- x402 adapter: `src/x402Adapter.js`
- ACP adapter: `src/acpAdapter.js`
- API gateway: `src/apiServer.js`
