# Integration with ELO Core / 与 ELO Core 集成说明

## 中文

### 目标
将私有 `AdaptiveRiskPolicy` 绑定到公开 ELO `SettlementEngine`，在不公开生产策略细节的前提下增强风控。

### 步骤
1. 部署 `AdaptiveRiskPolicy`，并传入 `SETTLEMENT_ENGINE_ADDR`。
2. 在 ELO Core 中执行 `SettlementEngine.setRiskPolicy(policyAddr)`。
3. 后续结算将自动走：
   - `validateSettlement(...)`
   - `recordSettlement(...)`

### 关键要求
- `recordSettlement` 必须仅允许 settlementEngine 调用。
- 保持与 ELO 核心接口一致（`IRiskPolicy`）。

## English

### Goal
Attach private `AdaptiveRiskPolicy` to public ELO `SettlementEngine` while keeping production policy logic private.

### Steps
1. Deploy `AdaptiveRiskPolicy` with `SETTLEMENT_ENGINE_ADDR`.
2. Call `SettlementEngine.setRiskPolicy(policyAddr)` in ELO core.
3. Settlement flow will automatically call:
   - `validateSettlement(...)`
   - `recordSettlement(...)`

### Requirements
- `recordSettlement` must be callable only by settlementEngine.
- Keep full compatibility with ELO core `IRiskPolicy` interface.
