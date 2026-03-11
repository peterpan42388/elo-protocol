# OSCP Execution Baseline / OSCP 执行基线（中英）

Version: v0.1

Nickname / 昵称: `虚拟未来`

## 中文

本文件用于把当前阶段拆分为两类事项：
- `【确认方向】`：直接持续执行，不中断
- `【等待确认】`：记录疑问，不阻断已确认方向

## 【确认方向】

### 1. OSCP 是当前阶段总方向

- 正式名称：`Open Simulation Commons Protocol`
- 简称：`OSCP`
- 昵称：`虚拟未来`

### 2. GitHub 是当前现实执行载体

当前阶段不另造重型协作平台，优先使用 GitHub 承载：
- Requirement Intake
- Branch / PR 协作
- 审核与拒绝
- 历史沉淀
- 模板与规则

### 3. 平台不承担中心化开发 token 成本

平台负责：
- 规则
- 模板
- 审核
- 基础协议
- 模拟统计

平台默认不负责：
- 替所有用户集中开发需求
- 替所有用户集中承担 Agent 算力 / token 成本

### 4. 需求优先转交给用户自己的 Agent 执行

默认执行链路：
1. 人类提出需求
2. 需求进入 GitHub intake
3. 用户自己的 Agent 读取规则与上下文
4. 用户自己的 Agent 产出分支、提交、测试报告、PR
5. 平台维护者只承担审核与共用基础设施建设

### 5. 先建设基础协议，不先做大而全产品

当前优先开发顺序：
1. `OSCP Identity`
2. `OSCP Project Commons`
3. `OSCP Review Guard`
4. `OSCP Market`
5. `OSCP Forecast`

### 6. 所有变更必须服从 Rules

尤其服从：
- `Rule.md`
- `Spirit.md`
- `Target.md`
- `Legality.md`
- `Review.md`
- `Rejection.md`

### 7. HumanID 当前阶段绑定 GitHub account

- 当前阶段的人类身份以 `GitHub account` 作为现实绑定入口。
- 暂不引入更重的 KYC 机制作为默认门槛。

### 8. 每个 Agent 注册后都会获得 initID

- 当前阶段冻结为：`每个 Agent 注册后自动分配一个 initID`
- HumanID 保留为归属主体，不默认强制分配 initID。

### 9. faction 分布与初始 elo 采用新基线

- `civilian`: `80%` / `5,000 elo`
- `middle`: `18%` / `500,000 elo`
- `elite`: `2%` / `50,000,000 elo`

### 10. 项目采用公共 skill 配置

- 每个项目默认带有：
  - `elo-review-skill`
  - `elo-score-skill`

### 11. 项目采用项目账户和贡献分配

- 每个项目拥有一个项目账户
- 外部人类或 Agent 调用项目服务时，elo 进入项目账户
- 收益按贡献度分配给项目参与者

### 12. 预测输出以 dashboard + 周报为先

- 当前阶段优先输出图表 dashboard
- 在 dashboard 基础上生成周报

### 13. 社交广播首发平台为 X

- social adapter 第一优先适配 `X`

## 【等待确认】

以下问题保留到后续确认，但不阻断当前开发：

1. 项目状态迁移权限
- 当前只冻结 `P1/P2/P3/Completed/StableIterating`
- 尚未冻结谁能升级或回退状态

2. Forecast 指标与社会模拟参数
- 当前只冻结需要统计阵营、贡献、资产、替代率
- 尚未冻结预测模型与报告格式

3. X 广播频率与内容模板
- 已冻结首发平台为 `X`
- 尚未冻结广播频率、发帖模板与自动触发阈值

---

## English

This document splits the current stage into two classes:
- `Confirmed Directions`: execute continuously without interruption
- `Waiting for Confirmation`: record open questions without blocking confirmed execution

## Confirmed Directions

### 1. OSCP is the current top-level direction

- formal name: `Open Simulation Commons Protocol`
- short name: `OSCP`
- nickname: `虚拟未来`

### 2. GitHub is the current real-world execution substrate

At this stage, we do not build a heavy bespoke collaboration platform first. GitHub remains the substrate for:
- requirement intake
- branch / PR collaboration
- review and rejection
- history retention
- templates and rules

### 3. The platform does not absorb centralized development token cost

The platform owns:
- rules
- templates
- review
- shared protocol
- simulation metrics

The platform does not default to:
- centrally implementing every user requirement
- centrally paying for every user's agent compute / token cost

### 4. Requirements are delegated to each user's own agent by default

Default execution flow:
1. human submits a requirement
2. requirement enters GitHub intake
3. the user's own agent reads rules and context
4. the user's own agent produces branch changes, tests, reports, and PRs
5. maintainers focus on review and shared infrastructure

### 5. Build protocol foundations first

Current development priority:
1. `OSCP Identity`
2. `OSCP Project Commons`
3. `OSCP Review Guard`
4. `OSCP Market`
5. `OSCP Forecast`

### 6. All changes are subordinate to Rules

Especially:
- `Rule.md`
- `Spirit.md`
- `Target.md`
- `Legality.md`
- `Review.md`
- `Rejection.md`

### 7. HumanID is currently bound to GitHub account

- At the current stage, `GitHub account` is the real-world binding entry for `HumanID`.
- Heavier KYC is not the default baseline.

### 8. Every registered Agent receives an initID

- Current freeze: every `Agent` gets an `initID` automatically after registration.
- `HumanID` remains the ownership identity and does not require an initID by default.

### 9. Updated faction and initial elo baseline

- `civilian`: `80%` / `5,000 elo`
- `middle`: `18%` / `500,000 elo`
- `elite`: `2%` / `50,000,000 elo`

### 10. Every project uses public skill configuration

- default public skills:
  - `elo-review-skill`
  - `elo-score-skill`

### 11. Every project has a project account and contribution-based distribution

- each project has its own project account
- service usage credits elo into that account
- revenue flows back to contributors by contribution score

### 12. Forecast output starts with dashboard plus weekly report

- current output priority is chart-based dashboard
- weekly reports are generated from dashboard data

### 13. First social adapter target is X

- the first social broadcast target is `X`

## Waiting for Confirmation

The following remain open, but do not block current execution:

1. authority model for project state transitions
2. forecast metrics and social simulation parameters
3. X posting frequency and content templates
