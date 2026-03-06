#!/usr/bin/env bash
set -euo pipefail

RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"
WALLETS_JSON="${WALLETS_JSON:-/tmp/elo-p0p2-wallets.json}"

WALLET_COUNT="${WALLET_COUNT:-6}" \
FUND_ETH="${FUND_ETH:-50}" \
RPC_URL="$RPC_URL" \
OUTPUT_JSON="$WALLETS_JSON" \
AUTO_START_ANVIL=1 \
  bash scripts/bootstrap-virtual-wallets.sh

node --test tests/eloMarket.p0-p2.test.js

echo "P0/P2 local checks completed"
echo "wallets manifest: $WALLETS_JSON"
