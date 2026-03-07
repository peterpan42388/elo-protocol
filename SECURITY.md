# Security Policy

## Supported Versions
- main branch: supported

## Reporting a Vulnerability
Do not open public issues for vulnerabilities.
Use GitHub Security Advisories (private reporting) for this repository.

## Security Requirements
- No plaintext secrets in repository.
- No private keys, certificates, or wallet seeds in commits.
- All settlement-critical changes must include regression tests.

## Baseline Controls (P4-A)
- API rate limiting (in-memory, per client key/IP)
- Request JSON content-type enforcement on POST endpoints
- Request body size guard to mitigate oversized payload abuse
- Input validation on settlement and market critical identifiers and numeric fields
- Replay protection on settlement request IDs (existing invariant)
- Bounded in-memory state queues and cleanup for x402/acp adapters

## API Security Config
- `API_RATE_LIMIT_MAX` (default: `2000`)
- `API_RATE_LIMIT_WINDOW_MS` (default: `60000`)
- `API_BODY_MAX_BYTES` (default: `65536`)
- `API_RATE_LIMIT_MAX_CLIENTS` (default: `10000`)
- `X402_DEFAULT_TTL_MS` (default: `120000`)
- `X402_MAX_PENDING` (default: `5000`)
- `X402_MAX_SETTLED` (default: `10000`)
- `ACP_DEFAULT_ESCROW_TTL_MS` (default: `300000`)
- `ACP_MAX_INTENTS` (default: `5000`)
- `ACP_MAX_ESCROWS` (default: `5000`)
- `ACP_TERMINAL_RETENTION_MS` (default: `3600000`)
- `API_AUTH_BEARER_TOKEN` (optional; when set, all `POST` APIs require `Authorization: Bearer <token>`)

These controls are intended as baseline protections for prototype and staging environments.
Production deployments should layer additional controls (WAF, reverse-proxy rate limit, authn/authz, structured audit logging, and external security review).

## Audit Prep Assets (P4-B)
- `docs/security/P4B_AUDIT_PREP.zh-en.md`
- `docs/security/THREAT_MODEL.zh-en.md`
- `docs/security/RISK_MATRIX.zh-en.md`
- `docs/security/SECURITY_REVIEW_CHECKLIST.zh-en.md`
- `docs/security/REGRESSION_STRATEGY.zh-en.md`
- `docs/security/P4C_SECURITY_REVIEW_REPORT.zh-en.md`
