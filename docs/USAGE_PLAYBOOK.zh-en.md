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

### 4.1) HMAC 签名调用示例（可选）
```bash
TS=$(date +%s%3N)
CANONICAL=$'POST\n/register-agent\n'"$TS"
SIG=$(printf '%s' "$CANONICAL" | openssl dgst -sha256 -hmac "$API_AUTH_HMAC_SECRET" -hex | awk '{print $2}')
curl -X POST https://elo.metavie.co/register-agent \
  -H "Authorization: Bearer $API_AUTH_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-ELO-Timestamp: $TS" \
  -H "X-ELO-Signature: sha256=$SIG" \
  -d '{"agentId":"agent-demo-1","ownerId":"owner-demo-1"}'
```

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

### 4.1) Optional HMAC-signed request example
```bash
TS=$(date +%s%3N)
CANONICAL=$'POST\n/register-agent\n'"$TS"
SIG=$(printf '%s' "$CANONICAL" | openssl dgst -sha256 -hmac "$API_AUTH_HMAC_SECRET" -hex | awk '{print $2}')
curl -X POST https://elo.metavie.co/register-agent \
  -H "Authorization: Bearer $API_AUTH_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-ELO-Timestamp: $TS" \
  -H "X-ELO-Signature: sha256=$SIG" \
  -d '{"agentId":"agent-demo-1","ownerId":"owner-demo-1"}'
```

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
