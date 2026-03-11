# OSCP State Transition Policy / OSCP 项目状态迁移策略（中英）

Version: v0.1

## 中文

OSCP 当前采用三层状态迁移模型：

1. 轻迁移
- `P1 -> P2`
- 发起角色：`proposer` 或 `maintainer`
- 强制条件：`reviewApproved = true`

2. 关键迁移
- `P2 -> P3`
- 发起角色：`maintainer`
- 强制条件：
  - `reviewApproved = true`
  - `testsPassed = true`

- `P3 -> Completed`
- 发起角色：`maintainer`
- 强制条件：
  - `governanceApproved = true`
  - `testsPassed = true`
  - `riskAcknowledged = true`

- `Completed -> StableIterating`
- 发起角色：`maintainer`
- 强制条件：
  - `testsPassed = true`

3. 回退迁移
- 允许角色：
  - `maintainer`
  - `governance`
- 强制条件：
  - 必须给出 `reason`

当前 API:
- `POST /oscp/projects/state/transition`

## English

OSCP currently uses a three-layer state transition model:

1. light transitions
- `P1 -> P2`
- by `proposer` or `maintainer`
- requires `reviewApproved = true`

2. critical transitions
- `P2 -> P3`
- by `maintainer`
- requires `reviewApproved = true` and `testsPassed = true`

- `P3 -> Completed`
- by `maintainer`
- requires `governanceApproved = true`, `testsPassed = true`, and `riskAcknowledged = true`

- `Completed -> StableIterating`
- by `maintainer`
- requires `testsPassed = true`

3. rollback transitions
- by `maintainer` or `governance`
- requires `reason`
