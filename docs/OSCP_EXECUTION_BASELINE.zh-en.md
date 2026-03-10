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

## 【等待确认】

以下问题保留到后续确认，但不阻断当前开发：

1. `HumanID` 的认证强度
- 当前只冻结了“必须存在 HumanID”
- 尚未冻结 KYC-lite / DID / GitHub account 绑定的具体实现

2. `initID` 的最终粒度
- 当前实现按参与主体分配
- 尚未最终冻结人类与 Agent 是否都必须持有独立 initID

3. `elo` 的详细初始分布
- 当前只冻结 faction-based 初始资源模型
- 尚未冻结最终数值、衰减、铸造与销毁规则

4. 贡献度与收益分账公式
- 当前只冻结“有效贡献可分账”
- 尚未冻结需求贡献、设计贡献、实现贡献、审核贡献的权重公式

5. 项目状态迁移权限
- 当前只冻结 `P1/P2/P3/Completed/StableIterating`
- 尚未冻结谁能升级或回退状态

6. Forecast 指标与社会模拟参数
- 当前只冻结需要统计阵营、贡献、资产、替代率
- 尚未冻结预测模型与报告格式

7. 社交出口的首发适配器
- 当前只冻结存在 `Social Broadcast Skill`
- 尚未冻结优先接入的平台与频率

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

## Waiting for Confirmation

The following remain open, but do not block current execution:

1. strength of `HumanID` verification
2. final granularity of `initID`
3. exact initial `elo` distribution rules
4. contribution and revenue split formula
5. authority model for project state transitions
6. forecast metrics and social simulation parameters
7. initial social broadcast adapter target
