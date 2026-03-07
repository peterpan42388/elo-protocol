# Dashboard API Contract v1 (ZH/EN)

## 中文

### 目的
冻结 ELO Dashboard 的最小可用接口契约，供前端直接对接。版本号固定为 `dashboard.v1`。

### 兼容策略
1. `dashboard.v1` 中已有字段不删除、不改名、不改类型。
2. 新字段只追加，不破坏旧字段。
3. 破坏性变更必须升级为 `dashboard.v2`。

### 接口清单
1. `GET /dashboard/schema`
2. `GET /dashboard/summary`
3. `GET /dashboard/agents`
4. `GET /dashboard/offers`
5. `GET /dashboard/trades?limit=100`
6. `GET /dashboard/savings`

### `GET /dashboard/summary`
```json
{
  "schemaVersion": "dashboard.v1",
  "generatedAt": 1772816000000,
  "kpis": {
    "ownerCount": 3,
    "agentCount": 8,
    "offerCount": 2,
    "tradeCount": 5,
    "billableSettlementCount": 5,
    "freeSettlementCount": 2,
    "settlementVolumeElo": 1.234,
    "rechargeVolumeElo": 100,
    "withdrawVolumeElo": 0
  }
}
```

### `GET /dashboard/agents`
```json
{
  "schemaVersion": "dashboard.v1",
  "generatedAt": 1772816000000,
  "items": [
    {
      "agentId": "agent-a",
      "ownerId": "owner-1",
      "balance": 9.91,
      "rechargeVolumeElo": 10,
      "withdrawVolumeElo": 0,
      "settlementPaidInElo": 0.09,
      "settlementEarnedInElo": 0,
      "settlementPaidCount": 1,
      "settlementEarnedCount": 0,
      "settlementFreeCount": 0
    }
  ]
}
```

### `GET /dashboard/offers`
```json
{
  "schemaVersion": "dashboard.v1",
  "generatedAt": 1772816000000,
  "items": [
    {
      "offerId": "offer-1",
      "providerAgentId": "agent-provider",
      "providerOwnerId": "owner-provider",
      "serviceId": "skill/optimizer",
      "computeUnits": 120,
      "energyKwh": 0.1,
      "marketMultiplier": 1,
      "metadata": {},
      "createdAt": 1772816000000
    }
  ]
}
```

### `GET /dashboard/trades?limit=100`
```json
{
  "schemaVersion": "dashboard.v1",
  "generatedAt": 1772816000000,
  "total": 5,
  "limit": 100,
  "aggregates": {
    "billableCount": 5,
    "freeCount": 0,
    "volumeElo": 1.234
  },
  "items": [
    {
      "offerId": "offer-1",
      "serviceId": "skill/optimizer",
      "providerAgentId": "agent-provider",
      "providerOwnerId": "owner-provider",
      "consumerAgentId": "agent-consumer",
      "consumerOwnerId": "owner-consumer",
      "requestId": "req-001",
      "amount": 0.12,
      "billable": true,
      "ts": 1772816000000
    }
  ]
}
```

### `GET /dashboard/savings`
```json
{
  "schemaVersion": "dashboard.v1",
  "generatedAt": 1772816000000,
  "total": 3,
  "aggregates": {
    "totalSavingsAmount": 0.6,
    "avgSavingsRate": 0.31,
    "maxSavingsRate": 0.42
  },
  "items": [
    {
      "offerId": "offer-1",
      "serviceId": "skill/optimizer",
      "providerAgentId": "agent-provider",
      "consumerAgentId": "agent-consumer",
      "baselineAmount": 0.75,
      "purchaseAmount": 0.05,
      "optimizedAmount": 0.45,
      "totalWithMarket": 0.5,
      "savingsAmount": 0.25,
      "savingsRate": 0.333,
      "ts": 1772816000000
    }
  ]
}
```

## English

### Purpose
Freeze a minimal dashboard contract for direct frontend integration. Schema version is fixed at `dashboard.v1`.

### Compatibility policy
1. Existing `dashboard.v1` fields are never removed/renamed/retyped.
2. New fields are additive only.
3. Breaking changes require `dashboard.v2`.

### Endpoints
1. `GET /dashboard/schema`
2. `GET /dashboard/summary`
3. `GET /dashboard/agents`
4. `GET /dashboard/offers`
5. `GET /dashboard/trades?limit=100`
6. `GET /dashboard/savings`

Field-level examples above are the normative v1 wire contract.
