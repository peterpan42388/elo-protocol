# Open Source Scope (ZH/EN) / 开源范围说明（中英）

## 中文

ELO 采用“协议核心开源 + 风控策略可私有扩展”的模式。

### A. 必须开源（本仓库）
1. 协议不变量与结算规则
2. 核心合约与测试
3. 公共接口与数据结构
4. 安全基线（重放保护、权限控制）
5. 文档与集成示例

### B. 建议私有（独立私有仓库或私有模块）
1. 实时风控规则引擎（欺诈检测、策略黑白名单）
2. 生产环境阈值参数（限额、频率、信誉阈值）
3. 合规连接器实现细节（KYC/AML 供应商侧配置）
4. 业务侧定价策略模型权重
5. 运营告警规则与内部排障脚本

### C. 公开但可插拔
1. 风控接口标准（开源）
2. 风控实现（可私有）
3. 争议处理流程接口（开源）
4. 裁决策略实现（可私有）
5. 插件接口文档：`docs/RISK_PLUGIN_INTERFACE.zh-en.md`

## English

ELO uses an "open protocol core + private risk strategy extensions" model.

### A. Must be open (this repo)
1. Protocol invariants and settlement rules
2. Core contracts and tests
3. Public interfaces and data structures
4. Security baselines (replay protection, access control)
5. Documentation and integration examples

### B. Recommended private (separate private repo/module)
1. Real-time risk engines (fraud detection, policy lists)
2. Production threshold parameters (limits, rates, reputation cutoffs)
3. Compliance connector implementation details (KYC/AML vendor-side config)
4. Business pricing model weights
5. Internal alerting and operations runbooks

### C. Public but pluggable
1. Risk interface standards (open)
2. Risk implementations (can be private)
3. Dispute flow interfaces (open)
4. Adjudication policy implementations (can be private)
5. Plugin interface doc: `docs/RISK_PLUGIN_INTERFACE.zh-en.md`
