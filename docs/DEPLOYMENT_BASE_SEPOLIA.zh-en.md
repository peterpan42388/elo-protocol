# Base Sepolia Deployment Guide / Base Sepolia 部署指南

## 1) Purpose / 目的

### 中文
本指南用于把 ELO 合约部署到 Base Sepolia，并执行一段链上演示流程：
- 跨归属结算（有实际转账）
- 同归属结算（免费，不转账）

### English
This guide deploys ELO contracts to Base Sepolia and runs an on-chain demo flow:
- cross-owner settlement (paid transfer),
- same-owner settlement (free, no transfer).

## 2) Prerequisites / 前置条件

### 中文
- 已安装 Foundry (`forge`)
- 有 Base Sepolia RPC
- 有部署私钥（测试网）

### English
- Foundry (`forge`) installed
- Base Sepolia RPC endpoint
- funded testnet deployer private key

## 3) Environment Variables / 环境变量

```bash
export BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
export DEPLOYER_PRIVATE_KEY="0x..."
# optional
export PROVIDER_ADDR="0x..."
export INITIAL_MINT_WEI="1000000000000000000000"
export CROSS_AMOUNT_WEI="10000000000000000000"
# optional, for source verification
export BASESCAN_API_KEY="..."
```

## 4) Deploy Command / 部署命令

```bash
npm run deploy:base-sepolia
```

or

```bash
bash scripts/deploy-base-sepolia.sh
```

## 5) Local Broadcast Dry Run / 本地广播验证

```bash
npm run deploy:local
```

This runs Anvil, deploys contracts, and executes the same scenario locally.

## 6) Script Behavior / 脚本行为说明

Script file: `script/DeployAndScenario.s.sol`

### 中文
脚本会：
1. 部署 `OwnerRegistry`, `ELOToken`, `SettlementEngine`
2. 注册 provider 与 consumer
3. 给 consumer 铸造 ELO 并授权 settlement
4. 执行一次跨归属结算并断言余额变化
5. 为演示将 consumer 改成同归属，再执行一次免费结算并断言余额不变

### English
The script will:
1. deploy `OwnerRegistry`, `ELOToken`, `SettlementEngine`
2. register provider and consumer
3. mint ELO to consumer and approve settlement
4. execute one cross-owner settlement and assert balance delta
5. remap consumer to same owner for demo, execute one free settlement and assert no balance change

## 7) Notes / 说明

### 中文
- 该脚本包含“改归属”的演示步骤，仅用于验证规则。
- 生产环境不建议在同一流程中改写归属关系。

### English
- The ownership remap step is for demonstration only.
- In production, ownership remapping should not be part of regular settlement flow.
