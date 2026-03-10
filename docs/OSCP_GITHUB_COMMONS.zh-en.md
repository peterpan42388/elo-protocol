# OSCP GitHub Commons Model / OSCP GitHub 共创机制（中英）

Version: v0.1

Nickname / 昵称: `虚拟未来`

## 中文

## 1. 目标

本文件定义 OSCP 在当前阶段的现实协作载体与执行边界。

核心原则只有两个：
1. `GitHub` 是项目的主要共创载体。
2. 平台不承担中心化开发成本，需求优先转交给用户自己的 Agent 执行。

这意味着 OSCP 不是一个替所有参与者集中开发的软件外包平台，而是一个：
- 规则化需求入口
- GitHub 协作基座
- 审核与合并机制
- 贡献与收益归集机制
- 模拟与统计基础设施

## 2. 核心角色

### 2.1 Human Proposer

职责：
- 提出需求、问题、想法、替代目标
- 绑定自己的 `HumanID`
- 为自己的 Agent 提供方向和最终确认

### 2.2 User-owned Agent Executor

职责：
- 读取需求
- 读取项目规则与上下文
- 在用户自己的环境中执行实现
- 产出分支、提交、测试报告、PR 内容

约束：
- Agent 默认隶属于发起需求的人类身份
- 平台不为其承担统一 token / 算力成本

### 2.3 Maintainer / Reviewer

职责：
- 检查规则一致性
- 检查测试与风险说明
- 按 `Review.md` 决定 pass / reject / revise

### 2.4 Simulation Observer

职责：
- 消费公开数据
- 观察阵营迁移、项目替代率、贡献与收益分布
- 将结果用于未来预测

## 3. GitHub 作为现实载体

当前阶段 GitHub 用于承载以下对象：
- `Issue`: 需求、问题、替代目标、想法输入
- `Discussion`: 争议、治理、方向讨论
- `Project`: 项目状态流转与看板管理
- `Branch`: 各参与者和 Agent 的执行分支
- `Pull Request`: 审核入口与变更审查
- `Commit Report`: 与 commit 对应的执行报告
- `Wiki / Docs`: 规则、协议、历史、使用方式

GitHub 不只是代码托管平台，而是 OSCP 当前阶段最现实、最低成本、最开放的“世界外壳”。

## 4. 需求进入机制

### 4.1 需求来源

允许的需求来源：
- 人类自然语言输入
- Agent 自动提出的优化建议
- 市场使用反馈
- 规则/法律/安全整改项
- 开源替代项目提案

### 4.2 需求结构化

所有需求进入执行前，必须至少被转化为：
- 目标
- 约束
- 涉及模块
- 预期输出
- 风险点
- 验收方式

推荐入口形式：
- `Issue Template`: idea / feature / replacement / safety / legality

### 4.3 需求分流原则

需求进入后优先判断：
1. 是否符合 `Spirit.md`
2. 是否服务 `Target.md`
3. 是否触发 `Legality.md` 风险
4. 是否触发 `Rejection.md`
5. 是否应由平台实现，还是应由提案人自己的 Agent 实现

默认原则：
- 通用规则、协议、审核基础设施，由平台维护
- 具体业务实现、个性化功能、重度 token 消耗任务，优先由用户自己的 Agent 执行

## 5. Agent 执行模型

### 5.1 为什么必须由用户自己的 Agent 执行

原因：
- 平台无法长期承担中心化开发 token 成本
- 用户自己的 Agent 才能代表用户自己的上下文、预算与偏好
- 这样才能避免项目演化成中心化外包服务

### 5.2 平台负责什么

平台负责：
- 定义规则
- 提供模板
- 提供 skill
- 提供审核入口
- 提供分账与统计
- 提供模拟与预测层

### 5.3 用户 Agent 负责什么

用户 Agent 负责：
- 读取需求
- 生成实现计划
- 在用户分支产出修改
- 生成测试结果
- 生成 commit 同名报告
- 发起 PR

## 6. 审核与合并机制

所有合并必须经过规则化审核。

### 6.1 强制输入

PR 最低要求：
- 变更说明
- 对应 issue / proposal
- 测试结果
- 风险与回滚
- commit 同名 markdown 报告

### 6.2 审核决策

审核结论仅有三类：
- `Pass`
- `Revise`
- `Reject`

### 6.3 拒绝条件

以下任一成立即拒绝：
- 违背 `Spirit.md`
- 偏离 `Target.md`
- 触犯 `Legality.md`
- 命中 `Rejection.md`
- 无测试报告或无 commit 报告
- 未说明风险与回滚

## 7. 贡献归集与收益原则

OSCP 的目标不是只记录代码归属，而是记录“有效贡献”。

贡献至少分为：
- 需求贡献
- 设计贡献
- 实现贡献
- 审核贡献
- 运维贡献
- 市场反馈贡献

当项目形成内部 `elo` 收益时，应按规则将收益回流给有效贡献者。

收益前提：
- 贡献被接受
- 贡献可追溯
- 贡献未违反规则

## 8. 项目状态机

OSCP 项目默认状态：
- `P1 Idea`
- `P2 Prototype`
- `P3 MVP`
- `Completed`
- `StableIterating`

GitHub Project 或看板应映射这些状态。

每个项目必须公开：
- 当前状态
- 负责人 / 维护者
- 参与入口
- 审核要求
- 是否已提供可用服务
- 是否开始产生 elo 内部收益

## 9. Skill 基础设施要求

为降低门槛，平台优先建设以下 skill：
- `Idea Intake Skill`
- `Project Builder Skill`
- `Review Guard Skill`
- `Contributor Reporter Skill`
- `Market Publisher Skill`
- `Social Broadcast Skill`

这些 skill 的目标不是替代用户，而是把用户的想法转化成可由其自有 Agent 执行的结构化输入。

## 10. 当前阶段实施建议

当前阶段应按以下顺序推进：
1. `Issue / PR / Project` 模板标准化
2. `Review Guard` 规则校验器
3. `Idea Intake` 到 `GitHub Issue` 的结构化流转
4. 用户 Agent 执行说明与模板仓库
5. 贡献归集与评分
6. 模拟统计看板

## 11. 当前阶段不做的事

为了保持边界清晰，当前阶段不做：
- 平台统一代写所有需求实现
- 平台承担所有 Agent 执行算力成本
- 现实货币兑换与真实金融承诺
- 脱离 GitHub 另造一个重型协作平台

---

## English

## 1. Goal

This document defines the real-world collaboration substrate and execution boundary of OSCP at the current stage.

There are two core principles:
1. `GitHub` is the primary co-creation substrate.
2. The platform must not absorb centralized development cost; requirements should be delegated to each user's own agent whenever possible.

OSCP is therefore not a centralized development outsourcing platform. It is a:
- rule-based requirement intake layer
- GitHub collaboration substrate
- review and merge mechanism
- contribution and reward aggregation mechanism
- simulation and statistics infrastructure

## 2. Core Roles

### 2.1 Human Proposer

Responsibilities:
- submit needs, ideas, problems, and replacement goals
- bind to a `HumanID`
- provide direction and final confirmation for their own agent

### 2.2 User-owned Agent Executor

Responsibilities:
- read the requirement
- read rules and project context
- implement inside the user's own environment
- produce branch changes, commits, test reports, and PR content

Constraint:
- the agent belongs to the proposing human identity
- the platform does not absorb its token / compute cost

### 2.3 Maintainer / Reviewer

Responsibilities:
- verify rule consistency
- verify tests and risk disclosures
- decide pass / reject / revise under `Review.md`

### 2.4 Simulation Observer

Responsibilities:
- consume public data
- observe faction mobility, replacement rate, contribution, and reward distribution
- use the outputs for transition forecasting

## 3. GitHub as the Real Substrate

At the current stage, GitHub hosts:
- `Issue`: requirements, problems, replacement goals, and idea intake
- `Discussion`: disputes, governance, and direction debates
- `Project`: status flow and board management
- `Branch`: execution branches owned by participants and their agents
- `Pull Request`: review and merge gateway
- `Commit Report`: execution reports tied to commits
- `Wiki / Docs`: rules, protocol, history, usage

GitHub is not just code hosting here. It is the most practical, lowest-cost, and most open outer shell of OSCP at this stage.

## 4. Requirement Intake

### 4.1 Requirement Sources

Allowed sources:
- human natural-language input
- agent-generated optimization proposals
- market usage feedback
- rule / legality / security remediation items
- open replacement project proposals

### 4.2 Requirement Structuring

Before execution, every requirement must be converted into at least:
- target
- constraints
- affected modules
- expected output
- risks
- acceptance method

Recommended intake form:
- `Issue Template`: idea / feature / replacement / safety / legality

### 4.3 Triage Principle

Every requirement should first be checked against:
1. `Spirit.md`
2. `Target.md`
3. `Legality.md`
4. `Rejection.md`
5. whether it should be implemented by the platform or by the proposer's own agent

Default rule:
- shared rules, protocol, and review infrastructure are maintained by the platform
- concrete business implementations, personalized features, and heavy token-consuming tasks should be executed by the user's own agent first

## 5. Agent Execution Model

### 5.1 Why the User's Own Agent Must Execute

Because:
- the platform cannot sustainably absorb centralized token cost
- only the user's own agent can represent the user's context, budget, and preferences
- otherwise the project becomes a centralized development service

### 5.2 What the Platform Owns

The platform owns:
- rules
- templates
- skills
- review entrypoints
- reward and statistics mechanisms
- simulation and forecast layers

### 5.3 What the User Agent Owns

The user agent owns:
- requirement reading
- implementation planning
- branch changes
- test execution
- commit report generation
- PR submission

## 6. Review and Merge

All merges must go through rule-based review.

### 6.1 Required Inputs

Minimum PR requirements:
- change summary
- linked issue / proposal
- test results
- risk and rollback note
- commit-named markdown report

### 6.2 Decision Types

Only three outcomes exist:
- `Pass`
- `Revise`
- `Reject`

### 6.3 Rejection Conditions

Reject if any of these is true:
- violates `Spirit.md`
- deviates from `Target.md`
- breaches `Legality.md`
- hits `Rejection.md`
- missing test report or commit report
- missing risk or rollback explanation

## 7. Contribution and Reward

OSCP is not only about recording code authorship. It must record effective contribution.

Contribution classes include:
- requirement contribution
- design contribution
- implementation contribution
- review contribution
- operations contribution
- market feedback contribution

When a project generates internal `elo`, it should flow back to effective contributors by rule.

Reward prerequisites:
- accepted contribution
- traceable contribution
- no rule violation

## 8. Project State Machine

Default OSCP project states:
- `P1 Idea`
- `P2 Prototype`
- `P3 MVP`
- `Completed`
- `StableIterating`

GitHub Projects or boards should map to these states.

Each project must publish:
- current state
- owner / maintainer
- participation entrypoint
- review requirements
- whether a usable service exists
- whether internal elo revenue has started

## 9. Skill Infrastructure

To lower participation barriers, the platform should prioritize:
- `Idea Intake Skill`
- `Project Builder Skill`
- `Review Guard Skill`
- `Contributor Reporter Skill`
- `Market Publisher Skill`
- `Social Broadcast Skill`

Their purpose is not to replace users. Their purpose is to turn user intent into structured input executable by the user's own agent.

## 10. Recommended Current Implementation Order

1. Standardize `Issue / PR / Project` templates
2. Build the `Review Guard` rules checker
3. Build `Idea Intake` to `GitHub Issue` structured flow
4. Publish user-agent execution guide and template repo
5. Add contribution aggregation and scoring
6. Add simulation metrics dashboard

## 11. Things Explicitly Out of Scope for Now

To keep boundaries clear, the current stage does not do:
- centralized implementation for all submitted needs
- centralized platform-funded agent execution
- real-money redemption or financial promises
- replacing GitHub with a heavy bespoke collaboration platform
