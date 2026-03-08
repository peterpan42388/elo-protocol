# Integration with ELO Core / 与 ELO Core 集成说明

## 中文

### 目标
将 `AdaptiveRiskPolicy` 绑定到 ELO `SettlementEngine`，增强可插拔风控能力。

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
Attach `AdaptiveRiskPolicy` to ELO `SettlementEngine` for pluggable risk control.

### Steps
1. Deploy `AdaptiveRiskPolicy` with `SETTLEMENT_ENGINE_ADDR`.
2. Call `SettlementEngine.setRiskPolicy(policyAddr)` in ELO core.
3. Settlement flow will automatically call:
   - `validateSettlement(...)`
   - `recordSettlement(...)`

### Requirements
- `recordSettlement` must be callable only by settlementEngine.
- Keep full compatibility with ELO core `IRiskPolicy` interface.
