# Risk Extension Architecture / 风控扩展架构

## 中文
此仓库用于承载 ELO 的私有风控实现，不改变 ELO 协议核心不变量。

- 输入：结算请求上下文（provider/consumer/amount/requestId/usageRef）
- 输出：允许、拒绝、或触发额外审计流程
- 目标：降低套利、刷单、盗刷和策略攻击风险

## English
This repo contains private risk implementations for ELO without changing protocol invariants.

- Input: settlement context (provider/consumer/amount/requestId/usageRef)
- Output: allow, reject, or route to additional audit flow
- Goal: reduce arbitrage, wash-trading, allowance-drain, and policy attacks
