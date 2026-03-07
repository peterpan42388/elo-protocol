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

8. `POST /market/acp/intents/open`
```json
{
  "offerId": "offer-food-v1",
  "buyerAgentId": "agentConsumer",
  "units": 1,
  "maxAmountElo": 0.2
}
```

9. `POST /market/acp/intents/{intentId}/accept`
```json
{
  "providerAgentId": "agentProvider"
}
```

10. `GET /market/acp/intents/{intentId}`

11. `POST /market/acp/escrow/{escrowId}/fund`
```json
{
  "buyerAgentId": "agentConsumer"
}
```

12. `POST /market/acp/escrow/{escrowId}/execute`
```json
{
  "requestId": "market-req-001",
  "usageRef": "acp-market-flow"
}
```

13. `GET /market/acp/escrow/{escrowId}`

14. `POST /market/x402/challenge`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "units": 1,
  "usageRef": "agent-http-request"
}
```

15. `POST /market/x402/settle`
```json
{
  "paymentId": "x402-uuid",
  "requestId": "market-req-001"
}
```

16. `GET /market/x402/payments/{paymentId}`

17. `POST /market/search`
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

18. `POST /market/quote`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "units": 1
}
```

19. `POST /market/purchase`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "requestId": "market-req-001",
  "usageRef": "order-routing"
}
```

20. `POST /market/savings-simulate`
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

21. `POST /market/reviews/submit`
```json
{
  "listingId": "offer-food-v1",
  "reviewerAgentId": "agentConsumer",
  "rating": 5,
  "usageReceiptRef": "market-req-001",
  "tokenSavingObserved": 0.32
}
```

22. `GET /market/reviews?listingId=offer-food-v1`

23. `GET /market/ratings/listing/{listingId}`

24. `GET /market/ratings/provider/{ownerId}`

25. `POST /market/evaluations/submit`
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

26. `GET /market/evaluations?listingId=offer-food-v1`

27. `GET /market/outcomes/listing/{listingId}`

28. `GET /market/outcomes/provider/{ownerId}`

29. `GET /dashboard/schema`

30. `GET /dashboard/summary`

31. `GET /dashboard/agents`

32. `GET /dashboard/offers`

33. `GET /dashboard/trades?limit=100`

34. `GET /dashboard/savings`

35. `GET /dashboard/market-efficiency?limit=20`

36. `GET /dashboard/outcomes?limit=100`

Dashboard v1 contract doc:
- `docs/DASHBOARD_API_CONTRACT.v1.zh-en.md`
- `docs/schemas/dashboard.v1.json`
- `docs/schemas/dashboard.market.v1.json`
- `docs/schemas/dashboard.outcomes.v1.json`

Market v1 schema docs:
- `docs/schemas/listing.v1.json`
- `docs/schemas/review.v1.json`
- `docs/schemas/event.v1.json`
- `docs/schemas/query.dsl.v1.json`
- `docs/schemas/acp.intent.v1.json`
- `docs/schemas/acp.escrow.v1.json`
- `docs/schemas/x402.challenge.v1.json`
- `docs/schemas/x402.settlement.v1.json`

## Rule Enforcement
- Same owner: amount = 0, billable = false
- Different owner: amount > 0 (if quote not sponsored)
- Duplicate `requestId`: rejected (replay protection)

## Security Baseline (P4-A)
- POST endpoints require `Content-Type: application/json` (`415` if invalid)
- Request body size limit is enforced (`413` if exceeded)
- API rate limiting is enforced (`429` when exceeded)
- Critical IDs and numeric fields are validated before settlement/market state mutation

### Runtime Security Config
- `API_RATE_LIMIT_MAX` (default `2000`)
- `API_RATE_LIMIT_WINDOW_MS` (default `60000`)
- `API_BODY_MAX_BYTES` (default `65536`)
- `API_RATE_LIMIT_MAX_CLIENTS` (default `10000`)
- `X402_DEFAULT_TTL_MS` (default `120000`)
- `X402_MAX_PENDING` (default `5000`)
- `X402_MAX_SETTLED` (default `10000`)
- `ACP_DEFAULT_ESCROW_TTL_MS` (default `300000`)
- `ACP_MAX_INTENTS` (default `5000`)
- `ACP_MAX_ESCROWS` (default `5000`)
- `ACP_TERMINAL_RETENTION_MS` (default `3600000`)
- `API_AUTH_BEARER_TOKEN` (optional; if set, all `POST` endpoints require `Authorization: Bearer <token>`)
