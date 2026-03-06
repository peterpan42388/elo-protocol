#!/usr/bin/env bash
set -euo pipefail

if ! command -v cast >/dev/null 2>&1 || ! command -v jq >/dev/null 2>&1; then
  if [[ -f "$HOME/.zshenv" ]]; then
    # shellcheck source=/dev/null
    source "$HOME/.zshenv"
  fi
fi

for bin in cast jq; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "missing dependency: $bin"
    exit 1
  fi
done

RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"
WALLET_COUNT="${WALLET_COUNT:-4}"
FUND_ETH="${FUND_ETH:-20}"
AUTO_START_ANVIL="${AUTO_START_ANVIL:-1}"
OUTPUT_JSON="${OUTPUT_JSON:-/tmp/elo-virtual-wallets-$(date +%s).json}"
ANVIL_LOG="${ANVIL_LOG:-/tmp/elo-virtual-wallets-anvil.log}"

# Avoid local RPC calls being routed through corporate/system HTTP proxies.
export NO_PROXY="127.0.0.1,localhost"
export no_proxy="127.0.0.1,localhost"

ANVIL_PID=""
cleanup() {
  if [[ -n "${ANVIL_PID}" ]]; then
    kill "${ANVIL_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if ! cast chain-id --rpc-url "$RPC_URL" >/dev/null 2>&1; then
  if [[ "$AUTO_START_ANVIL" != "1" ]]; then
    echo "rpc not reachable: $RPC_URL"
    exit 1
  fi

  if [[ "$RPC_URL" =~ ^http://(127\.0\.0\.1|localhost):([0-9]+)$ ]]; then
    port="${BASH_REMATCH[2]}"
    anvil --port "$port" --silent >"$ANVIL_LOG" 2>&1 &
    ANVIL_PID="$!"

    ready=0
    for _ in $(seq 1 40); do
      if cast chain-id --rpc-url "$RPC_URL" >/dev/null 2>&1; then
        ready=1
        break
      fi
      sleep 0.5
    done

    if [[ "$ready" -ne 1 ]]; then
      echo "failed to start anvil for $RPC_URL"
      sed -n '1,120p' "$ANVIL_LOG" || true
      exit 1
    fi
  else
    echo "rpc not reachable and auto-start only supports localhost RPC"
    echo "RPC_URL=$RPC_URL"
    exit 1
  fi
fi

wallets_json="$(cast wallet new --number "$WALLET_COUNT" --json)"

fund_wei="$(cast to-wei "$FUND_ETH" eth)"
fund_hex="$(cast to-hex "$fund_wei")"

while IFS= read -r addr; do
  cast rpc --rpc-url "$RPC_URL" anvil_setBalance "$addr" "$fund_hex" >/dev/null
  bal="$(cast balance "$addr" --rpc-url "$RPC_URL")"
  echo "funded $addr => $bal wei"
done < <(echo "$wallets_json" | jq -r '.[].address')

echo "$wallets_json" | jq --arg rpc "$RPC_URL" --arg fundEth "$FUND_ETH" --arg fundWei "$fund_wei" '{
  rpc_url: $rpc,
  wallet_count: (. | length),
  funded_eth_each: $fundEth,
  funded_wei_each: $fundWei,
  wallets: .
}' > "$OUTPUT_JSON"

echo "virtual wallets generated and funded"
echo "output: $OUTPUT_JSON"
