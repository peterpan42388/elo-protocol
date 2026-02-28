# ELO User Guide / ELO 使用文档

## 1) Prerequisites / 前置条件

### 中文
- Node.js 22+
- npm 10+
- Foundry（`forge`）

### English
- Node.js 22+
- npm 10+
- Foundry (`forge`)

## 2) Install / 安装

```bash
npm install
```

安装 Foundry（如未安装）：
```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.zshenv
foundryup
```

## 3) Run Local Prototype / 运行本地原型

### 中文
1. 运行 JS 规则测试：
```bash
npm test
```
2. 运行模拟交易 demo：
```bash
npm run demo
```
3. 启动 REST API：
```bash
npm start
```

### English
1. Run JS rule tests:
```bash
npm test
```
2. Run settlement demo:
```bash
npm run demo
```
3. Start REST API:
```bash
npm start
```

## 4) API Endpoints / API 接口

### 中文
- `POST /register-agent`
- `POST /recharge`
- `POST /quote`
- `POST /settle`
- `GET /balance/{agentId}`

`/settle` 必须提供唯一 `requestId`，否则会被拒绝。

### English
- `POST /register-agent`
- `POST /recharge`
- `POST /quote`
- `POST /settle`
- `GET /balance/{agentId}`

`/settle` requires a unique `requestId`, otherwise request is rejected.

## 5) Contract Tests / 合约测试

### 中文
标准合约测试：
```bash
npm run test:contracts
```
极限合约测试（更详细输出）：
```bash
npm run test:contracts:extreme
```

### English
Standard contract tests:
```bash
npm run test:contracts
```
Extreme contract tests (verbose):
```bash
npm run test:contracts:extreme
```

## 6) CI / 持续集成

### 中文
- `CI` 工作流：Node 测试 + Solidity 编译 + Foundry 合约测试。
- `Extreme Contract Tests`：可手动触发，也可定时触发。

### English
- `CI` workflow: Node tests + Solidity compile + Foundry contract tests.
- `Extreme Contract Tests`: manual and scheduled runs.

## 7) Known Gaps / 当前缺口

### 中文
- 还未实现链上签名委托结算（目前 consumer 自主发起）。
- 还未接入真实 oracle 定价与跨链桥。
- 还未完成外部审计。

### English
- Signature-based delegated settlement is not implemented yet (consumer-only trigger for now).
- Real oracle pricing and cross-chain bridge are not integrated yet.
- External audit not completed yet.

## 8) Deployment / 部署

### 中文
- 本地广播验证：`npm run deploy:local`
- Base Sepolia 部署：`npm run deploy:base-sepolia`
- 详细说明见：`docs/DEPLOYMENT_BASE_SEPOLIA.zh-en.md`

### English
- Local broadcast verification: `npm run deploy:local`
- Base Sepolia deployment: `npm run deploy:base-sepolia`
- Full guide: `docs/DEPLOYMENT_BASE_SEPOLIA.zh-en.md`
