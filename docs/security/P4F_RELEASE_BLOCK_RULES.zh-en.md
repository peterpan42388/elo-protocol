# P4-F Release Blocking Rules (ZH/EN)

## 中文

### 阻断规则
在发布前，满足任一条件即阻断：
1. 存在 `Critical` 或 `High` 严重级别且处于活跃态的发现。
2. 存在 `releaseBlock=true` 且处于活跃态的发现。
3. 存在 `accepted_risk` 但无签字元数据（`approvedBy/approvedAt/reason`）。
4. 存在已超过 `slaDueAt` 的活跃发现。

### 非阻断（需跟踪）
1. `Medium/Low` 且未超 SLA 的活跃发现。
2. `deferred` 状态（必须有后续计划链接）。

### 执行方式
- 本地：`npm run release:block:check`
- CI：在 `CI` 工作流中作为固定门禁。

## English

### Blocking rules
Release must be blocked if any of the following is true:
1. Any active finding with severity `Critical` or `High`.
2. Any active finding with `releaseBlock=true`.
3. Any `accepted_risk` finding missing sign-off metadata (`approvedBy/approvedAt/reason`).
4. Any active finding past `slaDueAt`.

### Non-blocking but tracked
1. Active `Medium/Low` findings still within SLA.
2. `deferred` findings (must carry a follow-up plan reference).

### Enforcement
- Local: `npm run release:block:check`
- CI: enforced as a required gate in workflow.
