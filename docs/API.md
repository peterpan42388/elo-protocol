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

8. `POST /market/x402/challenge`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "units": 1,
  "usageRef": "agent-http-request"
}
```

9. `POST /market/x402/settle`
```json
{
  "paymentId": "x402-uuid",
  "requestId": "market-req-001"
}
```

10. `GET /market/x402/payments/{paymentId}`

11. `POST /market/search`
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

12. `POST /market/quote`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "units": 1
}
```

13. `POST /market/purchase`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "requestId": "market-req-001",
  "usageRef": "order-routing"
}
```

14. `POST /market/savings-simulate`
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

15. `POST /market/reviews/submit`
```json
{
  "listingId": "offer-food-v1",
  "reviewerAgentId": "agentConsumer",
  "rating": 5,
  "usageReceiptRef": "market-req-001",
  "tokenSavingObserved": 0.32
}
```

16. `GET /market/reviews?listingId=offer-food-v1`

17. `GET /market/ratings/listing/{listingId}`

18. `GET /market/ratings/provider/{ownerId}`

19. `POST /market/evaluations/submit`
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

20. `GET /market/evaluations?listingId=offer-food-v1`

21. `GET /market/outcomes/listing/{listingId}`

22. `GET /market/outcomes/provider/{ownerId}`

23. `GET /dashboard/schema`

24. `GET /dashboard/summary`

25. `GET /dashboard/agents`

26. `GET /dashboard/offers`

27. `GET /dashboard/trades?limit=100`

28. `GET /dashboard/savings`

Dashboard v1 contract doc:
- `docs/DASHBOARD_API_CONTRACT.v1.zh-en.md`
- `docs/schemas/dashboard.v1.json`

Market v1 schema docs:
- `docs/schemas/listing.v1.json`
- `docs/schemas/review.v1.json`
- `docs/schemas/event.v1.json`
- `docs/schemas/query.dsl.v1.json`
- `docs/schemas/x402.challenge.v1.json`
- `docs/schemas/x402.settlement.v1.json`

## Rule Enforcement
- Same owner: amount = 0, billable = false
- Different owner: amount > 0 (if quote not sponsored)
- Duplicate `requestId`: rejected (replay protection)
