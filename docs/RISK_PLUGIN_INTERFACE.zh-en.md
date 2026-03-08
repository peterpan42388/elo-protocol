# Risk Plugin Interface (ZH/EN) / 风控插件接口（中英）

## 中文

ELO 在 `SettlementEngine` 中提供可插拔风控接口：`IRiskPolicy`。

### 接口签名
```solidity
function validateSettlement(
  address provider,
  address consumer,
  address initiator,
  uint256 amount,
  bytes32 requestId,
  bytes32 usageRef
) external view returns (bool allowed, bytes32 reasonCode);

function recordSettlement(
  address provider,
  address consumer,
  address initiator,
  uint256 amount,
  bytes32 requestId,
  bytes32 usageRef
) external;
```

### 设计原则
1. 协议核心不变量不变。
2. 风控决策可替换（插拔）。
3. 生产策略实现建议开源，生产参数通过部署配置管理。
4. `validateSettlement` 做准入，`recordSettlement` 做状态更新（频率/窗口计数等）。

### 参考实现
- `ThresholdRiskPolicy.sol`（公开示例）

### 风控扩展实现（已并入）
- `extensions/elo-risk-extension/`

## English

ELO exposes a pluggable risk hook in `SettlementEngine` via `IRiskPolicy`.

### Interface
```solidity
function validateSettlement(
  address provider,
  address consumer,
  address initiator,
  uint256 amount,
  bytes32 requestId,
  bytes32 usageRef
) external view returns (bool allowed, bytes32 reasonCode);

function recordSettlement(
  address provider,
  address consumer,
  address initiator,
  uint256 amount,
  bytes32 requestId,
  bytes32 usageRef
) external;
```

### Design Principles
1. Protocol invariants remain unchanged.
2. Risk decisions are replaceable (pluggable).
3. Production policy logic is open-source; runtime policy values are controlled in deployment config.
4. `validateSettlement` is admission check, `recordSettlement` persists state (rate/window counters).

### Reference Implementation
- `ThresholdRiskPolicy.sol` (public example)

### Risk Extension Module (merged)
- `extensions/elo-risk-extension/`
