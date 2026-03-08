# Open Source Scope (ZH/EN) / 开源范围说明（中英）

## 中文

ELO 采用“协议核心 + 风控扩展全面开源”的模式。

### A. 必须开源（本仓库）
1. 协议不变量与结算规则
2. 核心合约与测试
3. 公共接口与数据结构
4. 安全基线（重放保护、权限控制）
5. 文档与集成示例

### B. 公开实现 + 受控参数
1. 实时风控规则引擎实现（公开代码，便于审计）
2. 生产环境阈值参数（通过环境变量/部署配置管理，不写入仓库）
3. 合规连接器接口与适配器框架（公开）
4. 业务定价策略接口与可替换实现（公开）
5. 运营告警与排障流程文档（公开）

### C. 公开但可插拔
1. 风控接口标准（开源）
2. 风控实现（开源）
3. 争议处理流程接口（开源）
4. 裁决策略实现（开源）
5. 插件接口文档：`docs/RISK_PLUGIN_INTERFACE.zh-en.md`
6. 风控扩展模块目录：`extensions/elo-risk-extension/`

## English

ELO uses an "open protocol core + open risk extensions" model.

### A. Must be open (this repo)
1. Protocol invariants and settlement rules
2. Core contracts and tests
3. Public interfaces and data structures
4. Security baselines (replay protection, access control)
5. Documentation and integration examples

### B. Public implementation + controlled runtime parameters
1. Real-time risk engine implementations (open for auditability)
2. Production thresholds managed via env/deploy config (not committed as secrets)
3. Compliance connector interfaces and adapters (open)
4. Pricing strategy interfaces and replaceable implementations (open)
5. Operations and incident runbooks (open)

### C. Public but pluggable
1. Risk interface standards (open)
2. Risk implementations (open)
3. Dispute flow interfaces (open)
4. Adjudication policy implementations (open)
5. Plugin interface doc: `docs/RISK_PLUGIN_INTERFACE.zh-en.md`
6. Risk extension module path: `extensions/elo-risk-extension/`
