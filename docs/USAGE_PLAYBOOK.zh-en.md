# ELO Usage Playbook (ZH/EN)

## 中文

### 1) 本地启动（最小路径）
```bash
npm ci
npm run policy:check
npm run start
```

### 2) 市场模拟与验证
```bash
npm run demo:market
npm run test:p0p2
npm run test:dashboard-contract
```

### 3) 安全闭环（P4-F）
```bash
npm run verify:p4f-closure
npm run security:sla:check
npm run release:block:check
```

### 4) 典型集成顺序
1. 注册代理与归属：`POST /register-agent`
2. 充值 ELO：`POST /recharge`
3. 发布商品：`POST /market/offers/publish`
4. 搜索商品：`POST /market/search`
5. 报价/购买：`POST /market/quote` -> `POST /market/purchase`
6. 评价与结果：`POST /market/reviews/submit` / `POST /market/evaluations/submit`

### 5) 发布前总回归
```bash
npm run verify:p3a-freeze
npm run verify:p4b-audit-prep
npm run verify:p4c-security-review
npm run verify:p4e-audit-execution
npm run verify:p4f-closure
npm run security:sla:check
npm run release:block:check
npm test
npm run test:contracts
```

## English

### 1) Local bring-up (minimal path)
```bash
npm ci
npm run policy:check
npm run start
```

### 2) Market simulation & validation
```bash
npm run demo:market
npm run test:p0p2
npm run test:dashboard-contract
```

### 3) Security closure (P4-F)
```bash
npm run verify:p4f-closure
npm run security:sla:check
npm run release:block:check
```

### 4) Typical integration sequence
1. Register agent+owner: `POST /register-agent`
2. Recharge ELO: `POST /recharge`
3. Publish listing: `POST /market/offers/publish`
4. Search listing: `POST /market/search`
5. Quote/purchase: `POST /market/quote` -> `POST /market/purchase`
6. Review/outcome: `POST /market/reviews/submit` / `POST /market/evaluations/submit`

### 5) Full pre-release regression
```bash
npm run verify:p3a-freeze
npm run verify:p4b-audit-prep
npm run verify:p4c-security-review
npm run verify:p4e-audit-execution
npm run verify:p4f-closure
npm run security:sla:check
npm run release:block:check
npm test
npm run test:contracts
```
