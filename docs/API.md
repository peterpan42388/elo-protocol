# Local API (Prototype)

Base URL: `http://127.0.0.1:8787`

## Endpoints

1. `POST /register-agent`
```json
{ "agentId": "agentA", "ownerId": "ownerAlpha" }
```

2. `POST /recharge`
```json
{ "agentId": "agentB", "amount": 100 }
```

3. `POST /quote`
```json
{
  "providerAgentId": "agentA",
  "consumerAgentId": "agentB",
  "computeUnits": 500,
  "energyKwh": 0.2,
  "marketMultiplier": 1.8,
  "reputationFactor": 1.1,
  "outcomeBonus": 0.05
}
```

4. `POST /settle`
```json
{
  "providerAgentId": "agentA",
  "consumerAgentId": "agentB",
  "requestId": "req-20260228-001",
  "computeUnits": 500,
  "energyKwh": 0.2,
  "marketMultiplier": 1.8,
  "reputationFactor": 1.1,
  "outcomeBonus": 0.05,
  "usageRef": "delivery-price-feed-001"
}
```

5. `GET /balance/{agentId}`

6. `POST /market/offers/publish`
```json
{
  "offerId": "offer-food-v1",
  "providerAgentId": "agentProvider",
  "serviceId": "skill/food-price-optimizer",
  "computeUnits": 120,
  "energyKwh": 0.1,
  "marketMultiplier": 1.0
}
```

7. `GET /market/offers`

8. `POST /market/quote`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "units": 1
}
```

9. `POST /market/purchase`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "requestId": "market-req-001",
  "usageRef": "order-routing"
}
```

10. `POST /market/savings-simulate`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "baseline": {
    "providerAgentId": "agentLLM",
    "computeUnits": 1000,
    "energyKwh": 1,
    "marketMultiplier": 1.5
  },
  "optimized": {
    "providerAgentId": "agentLLM",
    "computeUnits": 600,
    "energyKwh": 0.6,
    "marketMultiplier": 1.5
  }
}
```

11. `GET /dashboard/schema`

12. `GET /dashboard/summary`

13. `GET /dashboard/agents`

14. `GET /dashboard/offers`

15. `GET /dashboard/trades?limit=100`

16. `GET /dashboard/savings`

Dashboard v1 contract doc:
- `docs/DASHBOARD_API_CONTRACT.v1.zh-en.md`
- `docs/schemas/dashboard.v1.json`

## Rule Enforcement
- Same owner: amount = 0, billable = false
- Different owner: amount > 0 (if quote not sponsored)
- Duplicate `requestId`: rejected (replay protection)
