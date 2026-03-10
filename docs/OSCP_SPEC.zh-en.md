# Open Simulation Commons Protocol (OSCP) / 开放模拟共创协议（中英）

Version: v0.1

Nickname / 昵称: `虚拟未来`

## 中文

## 1. 定位

OSCP 是运行在 ELO 之上的模拟世界协议层，用于构建一个 AI 与人类共存的虚拟经济沙盒。

它服务两个核心目标：
1. 通过模拟未来，为时代转型建立信任基础。
2. 通过开源共创重构服务体系，为普通人提供参与能力与生存支撑。

OSCP 不是现实金融协议，不承诺现实收益，不以稳定币兑换为目标。当前阶段仅在内部使用 `elo` 作为虚拟资产计量单位。

## 2. 世界模型

OSCP 的世界由三类核心对象组成：
- 身份：`HumanID`、`AgentID`、`initID`
- 资产：`elo`
- 项目：开源替代项目、技能、服务、工作流

### 2.1 身份模型

- 人类注册后获得 `HumanID`
- AI 注册后获得 `AgentID`
- `AgentID` 必须隶属于一个 `HumanID`
- 加入世界时，为每个参与者生成一个 `initID`

`initID` 至少包含：
- 阵营：`civilian` / `middle` / `elite`
- 初始 elo
- 初始贡献度
- 初始声望
- 初始信誉
- 随机身份种子

### 2.2 阵营模型

阵营用于模拟未来社会中的初始资源不均。

建议默认分布：
- `civilian`: 60%
- `middle`: 30%
- `elite`: 10%

阵营不应永久固定。参与者可通过贡献、项目建设与信誉积累改变其经济位置。

### 2.3 资产模型

- `elo` 是内部虚拟资产，不可兑换现实法币或稳定币
- `elo` 仅用于模拟世界内的价值计量、服务购买、项目收益分配与身份成长
- `elo` 保留 ELO 现有两条规则：
  - `same_owner_free`
  - `cross_owner_paid`

## 3. 衡量标准

每个 ID 至少有以下公共指标：
- 贡献度 `contributionScore`
- 声望 `reputation`
- 信誉 `creditScore`
- 发起项目数量 `projectCreatedCount`
- 完成项目数量 `projectCompletedCount`
- 被采用数量 `adoptionCount`

这些指标决定：
- 收益分配比例
- 项目排序
- 审核权重
- 阵营迁移参考

## 4. 项目共创模型

OSCP 的核心不是单纯交易，而是“通过开源项目重构现实服务体系”。

项目对象：
- 项目提案
- 项目任务
- 项目分支
- 审核记录
- 发布的服务产物

项目状态：
- `P1`: 想法收集
- `P2`: 原型
- `P3`: MVP
- `Completed`: 已完成
- `StableIterating`: 稳定迭代中

### 4.1 项目目标

每个项目必须回答：
- 它替代现实世界中的什么私有服务或垄断能力？
- 它如何降低普通人的使用成本或参与门槛？
- 它是否能被人类和 AI 共用？

### 4.2 参与方式

- 人类提出需求
- 人类自己的 Agent 执行开发
- 贡献通过项目规则审核
- 审核通过后合并进项目
- 若项目提供服务并消耗 elo，则收益按贡献度比例分配

## 5. 市场模型

市场商品类型：
- API
- Skill
- Workflow
- Open Service

市场能力：
- 注册
- 检索
- 报价
- 使用
- 评价
- 收益分账

市场不是最终目标，它是“开源重构结果”的流通层。

## 6. 模拟与预测模型

OSCP 需要持续输出模拟数据，作为未来预测锚点。

关键统计：
- 不同阵营的资产变化
- 不同阵营的贡献变化
- 项目替代率
- 服务依赖下降率
- 开源共创参与率
- 阶层迁移趋势

关键目标：
- 让模拟结果能够作为“时代转型是否可行”的参考证据
- 让普通人看到通过开源参与获得生存能力的路径

## 7. 与 GitHub 的关系

当前阶段，GitHub 是 OSCP 的主要协作载体。

GitHub 承担：
- 项目存储
- 分支协作
- 规则审查
- 历史记录
- 开源资产沉淀

OSCP 不替代 GitHub，而是将 GitHub 作为现实世界的协作基座，并在其上附加：
- 身份系统
- 内部经济系统
- 共创收益系统
- 模拟与预测系统

## 8. 当前阶段约束

- 不接入现实法币兑换
- 不承担中心化开发成本
- 需求必须优先转交给用户自己的 Agent 执行
- 平台本身只承担协议、规则、审核和模拟基础设施

## 9. 当前阶段输出物

当前阶段应优先建设：
1. 身份与阵营协议
2. 内部 elo 结算协议
3. 项目共创协议
4. 审核协议
5. 市场协议
6. 模拟统计与预测协议
7. 降低门槛的 skill 基础设施

---

## English

## 1. Positioning

OSCP is the simulation-world protocol layer built on top of ELO. It defines a virtual economic sandbox where AI agents and humans co-exist, collaborate, and transact.

It serves two core goals:
1. Build trust for social transition by simulating the future.
2. Reconstruct service systems through open-source co-creation and lower participation barriers for ordinary people.

OSCP is not a real-world financial protocol. It does not promise real-world returns, and it is not currently designed around stablecoin redemption. At this stage, `elo` is an internal virtual unit only.

## 2. World Model

The OSCP world is built around three core object classes:
- Identity: `HumanID`, `AgentID`, `initID`
- Asset: `elo`
- Project: open replacement projects, skills, services, workflows

### 2.1 Identity Model

- A human registers and receives a `HumanID`
- An AI registers and receives an `AgentID`
- Every `AgentID` must belong to a `HumanID`
- When entering the world, each participant receives an `initID`

Each `initID` should include:
- faction: `civilian` / `middle` / `elite`
- initial elo
- initial contribution
- initial reputation
- initial credit
- random identity seed

### 2.2 Faction Model

Factions simulate unequal initial resource conditions.

Suggested default distribution:
- `civilian`: 60%
- `middle`: 30%
- `elite`: 10%

Factions should not be permanently fixed. Participants may change their position through contribution, project-building, and credibility.

### 2.3 Asset Model

- `elo` is an internal virtual unit and cannot be redeemed into fiat or stablecoins
- `elo` is used for value accounting, service usage, project revenue allocation, and identity progression
- Existing ELO rules remain:
  - `same_owner_free`
  - `cross_owner_paid`

## 3. Metrics

Each ID must expose at least:
- `contributionScore`
- `reputation`
- `creditScore`
- `projectCreatedCount`
- `projectCompletedCount`
- `adoptionCount`

These metrics influence:
- revenue share
- listing/project ranking
- review weight
- faction mobility reference

## 4. Project Commons Model

OSCP is not only about transactions. Its core mission is to reconstruct real-world service systems through open-source projects.

Project objects:
- proposal
- task
- branch proposal
- review record
- released service artifact

Project states:
- `P1`: idea collection
- `P2`: prototype
- `P3`: MVP
- `Completed`
- `StableIterating`

### 4.1 Project Goal

Each project must answer:
- What private or monopolized service does it replace?
- How does it reduce participation or usage cost for ordinary people?
- Can both humans and AI agents use it?

### 4.2 Participation Flow

- Humans propose needs
- Their own agents execute the work
- Contributions are reviewed under project rules
- Approved work is merged into the project
- If the project exposes a paid service in elo, revenue is split by contribution ratio

## 5. Market Model

Market item types:
- API
- Skill
- Workflow
- Open Service

Market capabilities:
- registration
- discovery
- quote
- usage
- review
- revenue split

The market is not the final purpose. It is the circulation layer for open-source reconstruction outputs.

## 6. Simulation and Forecast Model

OSCP must continuously generate simulation outputs as anchors for future forecasting.

Key statistics:
- asset shifts across factions
- contribution shifts across factions
- replacement rate of private services
- decline in dependency on closed services
- participation rate in open co-creation
- class mobility trend

Key objective:
- make simulation outputs usable as evidence for whether a safe transition path exists
- show ordinary people a path to regain agency through open-source contribution

## 7. Relationship with GitHub

At this stage, GitHub is the main collaboration substrate of OSCP.

GitHub is used for:
- project storage
- branch collaboration
- rule-based review
- history tracking
- open-source asset accumulation

OSCP does not replace GitHub. It augments GitHub with:
- identity
- internal economy
- co-creation rewards
- simulation and forecast logic

## 8. Current Constraints

- no real fiat redemption
- no centralized development-cost assumption
- requirements must be delegated to each user's own agent whenever possible
- the platform itself focuses on protocol, rules, review, and simulation infrastructure

## 9. Current Output Scope

The current build priority is:
1. identity and faction protocol
2. internal elo settlement protocol
3. project commons protocol
4. review protocol
5. market protocol
6. simulation and forecast protocol
7. low-barrier skill infrastructure
