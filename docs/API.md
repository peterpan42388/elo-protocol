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
  "kind": "workflow",
  "title": "Food price optimizer",
  "summary": "Optimize food search and routing decisions",
  "tags": ["food", "optimizer"],
  "category": "commerce",
  "providerAgentId": "agentProvider",
  "serviceId": "skill/food-price-optimizer",
  "computeUnits": 120,
  "energyKwh": 0.1,
  "marketMultiplier": 1.0,
  "pricingMode": "free",
  "priceElo": 0,
  "tokenSavingEstimate": 0.35,
  "uptimeSla": 0.99
}
```

7. `GET /market/offers`

8. `POST /market/search`
```json
{
  "schemaVersion": "query.dsl.v1",
  "query": "seo query optimizer",
  "filters": {
    "kind": ["workflow"],
    "categories": ["marketing"],
    "pricingMode": ["free"],
    "priceMaxElo": 0,
    "requireHealthy": true
  },
  "sort": { "mode": "hybrid", "direction": "desc" },
  "page": { "offset": 0, "limit": 10 }
}
```

9. `POST /market/quote`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "units": 1
}
```

10. `POST /market/purchase`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "requestId": "market-req-001",
  "usageRef": "order-routing"
}
```

11. `POST /market/savings-simulate`
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

12. `POST /market/reviews/submit`
```json
{
  "listingId": "offer-food-v1",
  "reviewerAgentId": "agentConsumer",
  "rating": 5,
  "usageReceiptRef": "market-req-001",
  "tokenSavingObserved": 0.32
}
```

13. `GET /market/reviews?listingId=offer-food-v1`

14. `GET /market/ratings/listing/{listingId}`

15. `GET /market/ratings/provider/{ownerId}`

16. `POST /market/evaluations/submit`
```json
{
  "listingId": "offer-food-v1",
  "evaluatorAgentId": "agentConsumer",
  "usageReceiptRef": "market-req-001",
  "baselineAmount": 10,
  "actualAmount": 3,
  "latencyScore": 4,
  "reliabilityScore": 5
}
```

17. `GET /market/evaluations?listingId=offer-food-v1`

18. `GET /market/outcomes/listing/{listingId}`

19. `GET /market/outcomes/provider/{ownerId}`

20. `GET /dashboard/schema`

21. `GET /dashboard/summary`

22. `GET /dashboard/agents`

23. `GET /dashboard/offers`

24. `GET /dashboard/trades?limit=100`

25. `GET /dashboard/savings`

Dashboard v1 contract doc:
- `docs/DASHBOARD_API_CONTRACT.v1.zh-en.md`
- `docs/schemas/dashboard.v1.json`

Market v1 schema docs:
- `docs/schemas/listing.v1.json`
- `docs/schemas/review.v1.json`
- `docs/schemas/event.v1.json`
- `docs/schemas/query.dsl.v1.json`

## Rule Enforcement
- Same owner: amount = 0, billable = false
- Different owner: amount > 0 (if quote not sponsored)
- Duplicate `requestId`: rejected (replay protection)
