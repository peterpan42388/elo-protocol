# Private Risk Integration Runbook (ZH/EN)

## 中文

### 目标
将私有仓库 `elo-risk-extension` 的 `AdaptiveRiskPolicy` 接入公开 `elo-protocol` 的 `SettlementEngine`。

### 本地一键验证
```bash
npm run integrate:risk:local
```

执行顺序：
1. 部署 ELO Core（OwnerRegistry/ELOToken/SettlementEngine）
2. 部署私有 AdaptiveRiskPolicy
3. 绑定 `SettlementEngine.setRiskPolicy(policyAddr)`
4. 运行场景验证：
   - 允许一笔结算
   - 黑名单后策略校验返回拒绝（`CONSUMER_BLOCKED`）
   - 取消黑名单后恢复结算

### Base Sepolia 执行
```bash
export BASE_SEPOLIA_RPC_URL="..."
export DEPLOYER_PRIVATE_KEY="0x..."
npm run integrate:risk:base-sepolia
```

可选变量：
- `PROVIDER_ADDR`
- `CONSUMER_ADDR`
- `RISK_WINDOW_SIZE`
- `RISK_BASE_MAX_AMOUNT`
- `RISK_MAX_TX_PER_WINDOW`
- `RISK_HIGH_USAGE_THRESHOLD`
- `RISK_HIGH_USAGE_MULTIPLIER_BPS`

## English

### Goal
Integrate private `AdaptiveRiskPolicy` from `elo-risk-extension` into public `SettlementEngine` in `elo-protocol`.

### Local one-command verification
```bash
npm run integrate:risk:local
```

Flow:
1. Deploy ELO Core (OwnerRegistry/ELOToken/SettlementEngine)
2. Deploy private AdaptiveRiskPolicy
3. Attach policy via `SettlementEngine.setRiskPolicy(policyAddr)`
4. Execute verification scenario:
   - one allowed settlement
   - one denied policy validation (`CONSUMER_BLOCKED`) after blacklist
   - one restored settlement (unblock)

### Base Sepolia execution
```bash
export BASE_SEPOLIA_RPC_URL="..."
export DEPLOYER_PRIVATE_KEY="0x..."
npm run integrate:risk:base-sepolia
```

Optional variables:
- `PROVIDER_ADDR`
- `CONSUMER_ADDR`
- `RISK_WINDOW_SIZE`
- `RISK_BASE_MAX_AMOUNT`
- `RISK_MAX_TX_PER_WINDOW`
- `RISK_HIGH_USAGE_THRESHOLD`
- `RISK_HIGH_USAGE_MULTIPLIER_BPS`
