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

## OSCP Endpoints

6. `POST /oscp/humans/register`
```json
{
  "humanId": "human.leo",
  "metadata": { "displayName": "Leo", "githubLogin": "metavie-leo" }
}
```

7. `POST /oscp/agents/register`
```json
{
  "agentId": "agent.leo.builder",
  "humanId": "human.leo",
  "metadata": { "label": "Builder" }
}
```
Returns:
- agent metadata
- auto-assigned `initProfile`
- initial balance funded from faction baseline

8. `POST /oscp/init-ids/assign`
```json
{
  "subjectType": "human",
  "subjectId": "human.leo"
}
```

9. `POST /oscp/init-ids/metrics/update`
```json
{
  "initId": "init:human:human.leo",
  "deltas": {
    "contributionScore": 2,
    "reputation": 1
  }
}
```

10. `GET /oscp/identities/summary`

11. `POST /oscp/review-guard/requirements/evaluate`
```json
{
  "target": "Create protocol review automation",
  "replacementTarget": "manual repetitive review",
  "constraints": "must follow Rules and avoid centralized token cost",
  "deliverable": "review guard",
  "acceptance": "tests and policy checks",
  "risk": "false positives",
  "executionOwner": "shared_maintainers"
}
```

12. `POST /oscp/projects/create`
```json
{
  "projectId": "project.oscp.review-guard",
  "proposerHumanId": "human.leo",
  "title": "OSCP Review Guard",
  "summary": "Automate repository rule checks",
  "replacementTarget": "manual repetitive review",
  "executionOwner": "shared_maintainers"
}
```

13. `POST /oscp/projects/tasks/create`
```json
{
  "taskId": "task.oscp.review-guard.1",
  "projectId": "project.oscp.review-guard",
  "title": "Add rule checks",
  "description": "Add baseline automated checks for repository rules"
}
```

14. `POST /oscp/projects/proposals/submit`
```json
{
  "proposalId": "proposal.oscp.review-guard.1",
  "projectId": "project.oscp.review-guard",
  "branchName": "leo/review-guard",
  "submittedByHumanId": "human.leo",
  "summary": "Add review guard module",
  "commitReportPath": "docs/reports/abc1234.md"
}
```

15. `POST /oscp/projects/reviews/record`
```json
{
  "reviewId": "review.oscp.review-guard.1",
  "proposalId": "proposal.oscp.review-guard.1",
  "reviewerId": "maintainer.1",
  "decision": "Pass",
  "notes": "rules satisfied"
}
```

16. `POST /oscp/projects/contributions/record`
```json
{
  "contributionId": "contribution.oscp.review-guard.1",
  "projectId": "project.oscp.review-guard",
  "contributorInitId": "init:agent:agent.leo.builder",
  "contributorAgentId": "agent.leo.builder",
  "kind": "implementation",
  "demandRating": 5,
  "usageCount": 10,
  "accepted": true
}
```

17. `POST /oscp/projects/accounts/credit`
```json
{
  "projectId": "project.oscp.review-guard",
  "amount": 50,
  "source": "usage"
}
```

18. `POST /oscp/projects/revenue/distribute`
```json
{
  "projectId": "project.oscp.review-guard"
}
```

19. `POST /oscp/projects/state/transition`
```json
{
  "projectId": "project.oscp.review-guard",
  "nextState": "P2"
}
```

20. `GET /oscp/projects/summary`

## Market Endpoints

21. `POST /market/offers/publish`
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

22. `GET /market/offers`

23. `POST /market/acp/intents/open`
```json
{
  "offerId": "offer-food-v1",
  "buyerAgentId": "agentConsumer",
  "units": 1,
  "maxAmountElo": 0.2
}
```

24. `POST /market/acp/intents/{intentId}/accept`
```json
{
  "providerAgentId": "agentProvider"
}
```

25. `GET /market/acp/intents/{intentId}`

26. `POST /market/acp/escrow/{escrowId}/fund`
```json
{
  "buyerAgentId": "agentConsumer"
}
```

27. `POST /market/acp/escrow/{escrowId}/execute`
```json
{
  "requestId": "market-req-001",
  "usageRef": "acp-market-flow"
}
```

28. `GET /market/acp/escrow/{escrowId}`

29. `POST /market/x402/challenge`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "units": 1,
  "usageRef": "agent-http-request"
}
```

30. `POST /market/x402/settle`
```json
{
  "paymentId": "x402-uuid",
  "requestId": "market-req-001"
}
```

31. `GET /market/x402/payments/{paymentId}`

32. `POST /market/search`
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

33. `POST /market/quote`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "units": 1
}
```

34. `POST /market/purchase`
```json
{
  "offerId": "offer-food-v1",
  "consumerAgentId": "agentConsumer",
  "requestId": "market-req-001",
  "usageRef": "order-routing"
}
```

35. `POST /market/savings-simulate`
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

36. `POST /market/reviews/submit`
```json
{
  "listingId": "offer-food-v1",
  "reviewerAgentId": "agentConsumer",
  "rating": 5,
  "usageReceiptRef": "market-req-001",
  "tokenSavingObserved": 0.32
}
```

37. `GET /market/reviews?listingId=offer-food-v1`

38. `GET /market/ratings/listing/{listingId}`

39. `GET /market/ratings/provider/{ownerId}`

40. `POST /market/evaluations/submit`
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

41. `GET /market/evaluations?listingId=offer-food-v1`

42. `GET /market/outcomes/listing/{listingId}`

43. `GET /market/outcomes/provider/{ownerId}`

## Dashboard Endpoints

44. `GET /dashboard/schema`

45. `GET /dashboard/summary`

46. `GET /dashboard/agents`

47. `GET /dashboard/offers`

48. `GET /dashboard/trades?limit=100`

49. `GET /dashboard/savings`

50. `GET /dashboard/market-efficiency?limit=20`

51. `GET /dashboard/outcomes?limit=100`

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
- `docs/schemas/security.findings-triage.v1.json`

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
- `API_AUTH_HMAC_SECRET` (optional; if set, all `POST` endpoints require HMAC headers)
- `API_AUTH_HMAC_WINDOW_MS` (default `300000`)

### HMAC Header Contract
- `X-ELO-Timestamp`: unix epoch milliseconds
- `X-ELO-Signature`: `sha256=<hex-hmac>`
- canonical payload for signing: `METHOD + "\\n" + PATHNAME + "\\n" + TIMESTAMP`

### Security Operations Gates (P4-F)
- `npm run verify:p4f-closure`
- `npm run security:sla:check`
- `npm run release:block:check`
