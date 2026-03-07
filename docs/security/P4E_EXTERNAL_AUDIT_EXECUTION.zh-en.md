# P4-E External Audit Execution Pack (ZH/EN)

## 中文

### 目标
将外部安全审计从“讨论”推进到“可直接执行”，提供统一范围、交付物、SLA 和结案标准。

### 审计范围（首轮）
1. `src/settlementEngine.js`
2. `src/eloMarket.js`
3. `src/x402Adapter.js`
4. `src/acpAdapter.js`
5. `src/apiServer.js`
6. `contracts/SettlementEngine.sol`
7. `contracts/RiskPolicyHook.sol`
8. `contracts/RegistrarHook.sol`

### 审计交付物清单
1. 威胁建模复核（对齐 `THREAT_MODEL`）
2. 风险矩阵复核（对齐 `RISK_MATRIX`）
3. 发现清单（至少含：ID、级别、影响面、复现步骤、修复建议）
4. 修复验证报告（每条发现的状态：open/fixed/accepted risk）
5. 最终审计摘要（可公开版本）

### 严重级别与处理 SLA
- Critical：24 小时内给出缓解方案，72 小时内修复并验证
- High：3 个工作日内修复并验证
- Medium：2 周内进入修复计划并排期
- Low：纳入后续迭代，不得阻断发布

### 执行流程
1. 冻结审计版本（tag + commit hash）。
2. 输出审计上下文包：`THREAT_MODEL` / `RISK_MATRIX` / `CHECKLIST` / `P4C report`。
3. 审计方提交发现，使用统一模板（见 `.github/ISSUE_TEMPLATE/security-audit-finding.yml`）。
4. 项目方逐条修复并附测试证据。
5. 复审通过后生成最终报告并归档。

### 结案标准
1. Critical/High 为 0（或明确 accepted risk 且有签字记录）。
2. 修复项均有回归测试或策略门禁覆盖。
3. `SECURITY.md` 与用户文档完成同步更新。
4. 执行 `npm run security:sla:check` 与 `npm run release:block:check` 通过。

## English

### Objective
Move external security audit from planning to execution with a normalized scope, deliverables, SLA, and closeout criteria.

### Audit scope (first pass)
1. `src/settlementEngine.js`
2. `src/eloMarket.js`
3. `src/x402Adapter.js`
4. `src/acpAdapter.js`
5. `src/apiServer.js`
6. `contracts/SettlementEngine.sol`
7. `contracts/RiskPolicyHook.sol`
8. `contracts/RegistrarHook.sol`

### Audit deliverables
1. Threat-model review (aligned with `THREAT_MODEL`)
2. Risk-matrix review (aligned with `RISK_MATRIX`)
3. Findings list (ID, severity, impact, repro steps, remediation)
4. Fix verification report (open/fixed/accepted risk per finding)
5. Final audit summary (public-safe version)

### Severity and SLA
- Critical: mitigation plan in 24h, fixed+verified in 72h
- High: fixed+verified within 3 business days
- Medium: remediation plan scheduled within 2 weeks
- Low: tracked in backlog and non-blocking for release

### Execution workflow
1. Freeze audited version (tag + commit hash).
2. Provide audit context pack: `THREAT_MODEL` / `RISK_MATRIX` / `CHECKLIST` / `P4C report`.
3. Auditor submits findings through a normalized template (`.github/ISSUE_TEMPLATE/security-audit-finding.yml`).
4. Project team remediates each finding with test evidence.
5. Auditor re-validates and publishes final report.

### Closeout criteria
1. Zero Critical/High (or explicitly accepted with sign-off).
2. Every fix is covered by tests or regression gates.
3. `SECURITY.md` and user-facing docs are synchronized.
4. `npm run security:sla:check` and `npm run release:block:check` must pass.
