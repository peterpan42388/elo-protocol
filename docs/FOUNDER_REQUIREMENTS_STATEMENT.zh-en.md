# Founder Requirements Statement / 创始需求说明

## 中文（第一人称）
我最初提出 ELO 的原因，是我在观察 Web3 与 AI Agent 落地时发现了一个结构性断层：

1. Agent 的交易行为是高频、实时、自主决策的；
2. 现有主流支付路径仍然强依赖法币锚定资产（如稳定币）；
3. 当 Agent 之间大量互相调用服务时，直接走人类货币体系会引入不必要摩擦。

我认为未来会同时存在两套价值系统：
- 人类货币体系（法币/稳定币）
- AI 货币体系（Agent 原生结算单位）

ELO 的设计就是这两套体系之间的桥：
- 人类给自己的 Agent 充值 ELO；
- Agent 在网络内用 ELO 自主交易；
- 需要回笼时再转换回人类资产。

我对需求的核心判断有三点：

第一，ELO 不能只做单组织内部积分，它必须是跨个人/法人通用标准。只有跨归属流通，才有真实经济和生产力。

第二，同归属 Agent 间不应计费，跨归属才计费。这是我定义的基本边界：
- same owner free
- cross owner paid

第三，ELO 价值不能只锚定法币汇率。法币只应存在于充值/提现边界。Agent 内部结算要遵循 AI 世界的规则：
- 有客观成本锚（算力/能耗等）；
- 也允许市场化溢价（时效、质量、稀缺性、结果价值）。

基于这个判断，我把项目落地成一个开源协议原型：
- 身份与归属映射（OwnerRegistry）
- ELO 资产层（ELOToken）
- 结算引擎（SettlementEngine）
- 本地模拟器与 API
- 合约级安全测试（含攻击路径、防重放、fuzz、invariant）

我希望这个项目最终解决的问题是：
让 Agent 经济体拥有可执行、可验证、可扩展的原生结算基础设施，而不是把 AI 交易强行塞进人类支付习惯。

## English (First Person)
I initiated ELO after seeing a structural gap between Web3 rails and AI agent execution realities:

1. Agent transactions are high-frequency, real-time, and autonomous.
2. Most payment rails still depend on fiat-anchored assets (e.g., stablecoins).
3. For dense agent-to-agent service calls, routing every action through human monetary rails introduces avoidable friction.

I believe two value systems will coexist:
- a human monetary system (fiat/stablecoins),
- an AI monetary system (agent-native settlement units).

ELO is designed as the bridge:
- humans recharge ELO for their agents,
- agents transact natively in ELO,
- assets can be converted back to human rails at the boundary.

My core requirement analysis has three pillars:

First, ELO cannot be an internal points system for a single entity. It must be a cross-entity standard for individuals and organizations. Circulation across owners is what creates real economy and productivity.

Second, same-owner traffic should be free, while cross-owner traffic should be paid:
- same owner free
- cross owner paid

Third, ELO value cannot be reduced to fiat parity. Fiat belongs at on-ramp/off-ramp only. Internal AI settlement should follow AI-native rules:
- objective cost anchors (compute/energy),
- market-based pricing premiums (latency, quality, scarcity, outcome value).

From this analysis, I drove an open-source protocol prototype including:
- owner-agent identity mapping (OwnerRegistry),
- ELO asset layer (ELOToken),
- settlement engine (SettlementEngine),
- local simulator and API,
- contract-grade security testing (attack paths, replay protection, fuzz, invariants).

My end goal is clear:
to provide executable, verifiable, and extensible native settlement infrastructure for agent economies, instead of forcing AI transaction behavior into human payment habits.
