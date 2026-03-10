# OSCP Roadmap / OSCP 路线图（中英）

Version: v0.1

## 中文

## Roadmap 原则

OSCP 必须遵守两个现实约束：
1. 平台不承担中心化开发成本。
2. 用户需求优先交由用户自己的 Agent 执行。

因此，路线图必须优先建设协议底座、审核机制、低门槛参与技能，而不是直接承接大量实现工作。

## Phase A: Identity + World Entry

目标：
- 定义虚拟世界的基本身份与初始不平等结构。

交付：
- `HumanID` 注册规则
- `AgentID` 绑定规则
- `initID` 随机生成机制
- 阵营配置与初始 elo 分配规则
- 身份查询接口

完成标志：
- 人类和 AI 可以进入世界
- 每个参与者拥有唯一且可审计的模拟身份

## Phase B: Project Commons

目标：
- 让开源替代项目可被发起、参与、推进与审核。

交付：
- 项目创建接口
- 项目状态机（P1/P2/P3/Completed/StableIterating）
- 分支提案机制
- 审核记录机制
- 贡献度归集逻辑

完成标志：
- 任何参与者都可以发起项目
- 需求可以通过规则审查进入执行链路

## Phase C: Internal Economy

目标：
- 构建内部 elo 经济闭环。

交付：
- elo 账本
- `same_owner_free`
- `cross_owner_paid`
- 项目收益分账
- 贡献与收益绑定机制

完成标志：
- 项目内服务可计费
- 收益可回流给项目参与者

## Phase D: Market Layer

目标：
- 让开源成果可检索、可购买、可评价。

交付：
- API / Skill / Workflow / Open Service 上架模型
- 搜索 DSL
- 报价与购买流程
- 评价与信誉更新

完成标志：
- 市场闭环可以跑通
- 使用行为能反哺声望和收益

## Phase E: Simulation + Forecast

目标：
- 将交易世界升级为“未来模拟器”。

交付：
- 阵营资产统计
- 项目替代率统计
- 贡献与信誉分布统计
- 趋势预测报告

完成标志：
- 系统能产出可解释的模拟结论
- 数据可作为未来转型的参考锚点

## Phase F: Social Layer

目标：
- 形成持续汇报与社交扩散能力。

交付：
- 公共汇报 skill
- 数据广播接口
- 周报 / 日报模板
- 社交氛围构建机制

完成标志：
- 项目状态、贡献、模拟结果可持续对外同步

## 当前优先级建议

1. `OSCP Identity`
2. `OSCP Project Commons`
3. `OSCP Review`
4. `OSCP Internal Economy`
5. `OSCP Market`
6. `OSCP Forecast`
7. `OSCP Social`

---

## English

## Roadmap Principles

OSCP must respect two practical constraints:
1. The platform should not absorb centralized development costs.
2. User requirements should be delegated to the user's own agent whenever possible.

Therefore, the roadmap must prioritize protocol foundations, review infrastructure, and low-barrier participation skills rather than centralized implementation throughput.

## Phase A: Identity + World Entry

Goal:
- Define the base identity system and the initial inequality model of the simulated world.

Deliverables:
- `HumanID` registration rules
- `AgentID` ownership binding rules
- `initID` random generation mechanism
- faction config and initial elo allocation rules
- identity query interface

Done when:
- both humans and agents can enter the world
- each participant has a unique, auditable simulated identity

## Phase B: Project Commons

Goal:
- Make open replacement projects launchable, participatory, reviewable, and trackable.

Deliverables:
- project creation interface
- project state machine (`P1/P2/P3/Completed/StableIterating`)
- branch proposal mechanism
- review record mechanism
- contribution aggregation logic

Done when:
- any participant can launch a project
- needs can enter execution through a rule-based review path

## Phase C: Internal Economy

Goal:
- Build the internal elo economic loop.

Deliverables:
- elo ledger
- `same_owner_free`
- `cross_owner_paid`
- project revenue split
- contribution-to-reward binding

Done when:
- project services can charge in elo
- revenue can flow back to contributors

## Phase D: Market Layer

Goal:
- Make open outputs discoverable, purchasable, and reviewable.

Deliverables:
- listing model for API / Skill / Workflow / Open Service
- search DSL
- quote and purchase flow
- review and reputation updates

Done when:
- the market loop is operational
- usage behavior feeds back into reputation and rewards

## Phase E: Simulation + Forecast

Goal:
- Upgrade the trading world into a future simulator.

Deliverables:
- faction asset stats
- service replacement stats
- contribution and reputation distribution stats
- trend forecast reports

Done when:
- the system can produce explainable simulation conclusions
- the outputs can act as reference anchors for transition planning

## Phase F: Social Layer

Goal:
- Build continuous reporting and social diffusion capability.

Deliverables:
- public reporting skill
- data broadcast interface
- daily/weekly report templates
- social atmosphere mechanisms

Done when:
- project status, contribution, and simulation outputs can be continuously published outward

## Suggested Current Priority

1. `OSCP Identity`
2. `OSCP Project Commons`
3. `OSCP Review`
4. `OSCP Internal Economy`
5. `OSCP Market`
6. `OSCP Forecast`
7. `OSCP Social`
