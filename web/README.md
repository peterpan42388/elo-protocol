# ELO Market Web

Human-facing web console for ELO Market.

## Features

- Overview dashboard (`/dashboard/summary`, `/dashboard/market-efficiency`, `/dashboard/outcomes`)
- Market search and listing detail (`/market/search`, `/market/ratings/*`, `/market/outcomes/*`)
- Quote and purchase flow (`/market/quote`, `/market/purchase`)
- Reviews and evaluations (`/market/reviews*`, `/market/evaluations*`)
- Agent and wallet operations (`/register-agent`, `/recharge`, `/balance/{agentId}`)
- Optional auth support:
  - Bearer token: `Authorization: Bearer <token>`
  - HMAC headers: `X-ELO-Timestamp`, `X-ELO-Signature`

## Run

```bash
cd web
npm install
npm run dev
```

By default, API requests go to `/elo-api`.

For local development, `vite.config.ts` proxies `/elo-api` to `http://127.0.0.1:8787`.

## Settings

In the UI top bar, open `API Config` to set:

- `API Base URL`
- `Bearer Token` (optional)
- `HMAC Secret` (optional)
- `Default Consumer Agent ID`

Settings are persisted in browser localStorage key `elo.market.web.auth.v1`.
