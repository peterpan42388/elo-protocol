# P4-F Security Findings Triage Board (ZH/EN)

## 中文

### 目标
将安全发现管理从“文本报告”升级为“可执行闭环”。

### 数据源
- 机读看板：`docs/security/findings/triage-board.v1.json`
- Schema：`docs/schemas/security.findings-triage.v1.json`
- 录入模板：`.github/ISSUE_TEMPLATE/security-audit-finding.yml`

### 状态机
- 活跃态：`open`, `triaged`, `in_progress`, `ready_for_verify`, `reopened`
- 终态：`fixed`, `accepted_risk`, `deferred`

### 字段约束（最小）
1. `id`, `title`, `severity`, `status`, `openedAt`, `slaDueAt`, `releaseBlock` 必填。
2. `accepted_risk` 必须包含签字信息：`approvedBy`, `approvedAt`, `reason`。
3. 时间字段使用 ISO 8601 UTC。

### 当前快照
| ID | 严重级别 | 状态 | 组件 | 是否发布阻断 | 追踪 |
| --- | --- | --- | --- | --- | --- |
| P4C-F1 | high | fixed | `src/apiServer.js` | no | PR #17 |
| P4C-F2 | medium | fixed | `src/x402Adapter.js` | no | PR #17 |
| P4C-F3 | medium | fixed | `src/acpAdapter.js` | no | PR #17 |

### 执行命令
```bash
npm run security:sla:check
npm run release:block:check
```

## English

### Objective
Upgrade security finding management from static reports to an executable closure loop.

### Data sources
- Machine-readable board: `docs/security/findings/triage-board.v1.json`
- Schema: `docs/schemas/security.findings-triage.v1.json`
- Intake template: `.github/ISSUE_TEMPLATE/security-audit-finding.yml`

### State machine
- Active: `open`, `triaged`, `in_progress`, `ready_for_verify`, `reopened`
- Terminal: `fixed`, `accepted_risk`, `deferred`

### Required fields
1. `id`, `title`, `severity`, `status`, `openedAt`, `slaDueAt`, `releaseBlock` are required.
2. `accepted_risk` requires sign-off metadata: `approvedBy`, `approvedAt`, `reason`.
3. Date fields must be ISO 8601 UTC.

### Current snapshot
| ID | Severity | Status | Component | Release blocker | Tracking |
| --- | --- | --- | --- | --- | --- |
| P4C-F1 | high | fixed | `src/apiServer.js` | no | PR #17 |
| P4C-F2 | medium | fixed | `src/x402Adapter.js` | no | PR #17 |
| P4C-F3 | medium | fixed | `src/acpAdapter.js` | no | PR #17 |

### Commands
```bash
npm run security:sla:check
npm run release:block:check
```
