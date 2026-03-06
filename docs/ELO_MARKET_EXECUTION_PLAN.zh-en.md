# ELO Market Execution Plan (ZH/EN)

## 中文

### 背景
ELO 将作为 AI 市场（ELO Market）的结算核心。目标不是在 ELO 协议中塞入全部业务逻辑，而是保持 ELO 核心“通用+简洁”，市场能力通过上层模块扩展。

### 设计原则
1. 协议内核稳定：保留 `same_owner_free` / `cross_owner_paid` 不变量。
2. 市场逻辑外置：商品发现、匹配、推荐放在上层市场模块。
3. 脚本化验证优先：先在本地进行可重复的虚拟钱包与场景测试。

### 本次已落地
1. 虚拟钱包与测试资金注入：`scripts/bootstrap-virtual-wallets.sh`
2. P0/P2 场景测试：`tests/eloMarket.p0-p2.test.js`
3. 市场最小模块：`src/eloMarket.js`（发布/报价/购买/节省模拟）
4. API 脚手架（P3前置）：
   - `POST /market/offers/publish`
   - `GET /market/offers`
   - `POST /market/quote`
   - `POST /market/purchase`
   - `POST /market/savings-simulate`

### 运行方式
```bash
npm run wallet:virtual
npm run test:p0p2:local
npm run demo:market
npm test
```

### 待补资料/问题
1. ELO Market 的商品标准（skill/API/data 的统一元数据 schema）
2. 交易后评估标准（节省率、命中率、延迟）
3. P3 Web Dashboard 的最小字段集（你回来后可确认）

## English

### Context
ELO serves as the settlement core for ELO Market. The goal is to keep ELO protocol generic and simple, while market features are layered on top.

### Design principles
1. Stable protocol core: preserve `same_owner_free` / `cross_owner_paid` invariants.
2. Externalize market logic: discovery, matching, recommendation live in upper layers.
3. Script-first validation: reproducible virtual-wallet and local scenario testing.

### Delivered in this iteration
1. Virtual wallet + local funding script: `scripts/bootstrap-virtual-wallets.sh`
2. P0/P2 scenario tests: `tests/eloMarket.p0-p2.test.js`
3. Minimal market module: `src/eloMarket.js` (publish/quote/purchase/savings simulation)
4. API scaffold for P3 preparation:
   - `POST /market/offers/publish`
   - `GET /market/offers`
   - `POST /market/quote`
   - `POST /market/purchase`
   - `POST /market/savings-simulate`

### How to run
```bash
npm run wallet:virtual
npm run test:p0p2:local
npm run demo:market
npm test
```

### Pending inputs/questions
1. Unified product schema for skill/API/data listings
2. Post-trade evaluator KPIs (saving rate, accuracy, latency)
3. Minimum field set for P3 web dashboard (to confirm later)
