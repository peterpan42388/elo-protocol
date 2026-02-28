#!/usr/bin/env bash
set -euo pipefail

if ! command -v forge >/dev/null 2>&1 || ! command -v anvil >/dev/null 2>&1; then
  if [[ -f "$HOME/.zshenv" ]]; then
    # shellcheck source=/dev/null
    source "$HOME/.zshenv"
  fi
fi

# bypass global proxies for localhost RPC
export NO_PROXY="127.0.0.1,localhost"
export no_proxy="127.0.0.1,localhost"

ANVIL_PORT="${ANVIL_PORT:-8545}"
ANVIL_LOG="${ANVIL_LOG:-/tmp/elo-anvil.log}"

# avoid port conflicts from previous runs
if lsof -ti:"$ANVIL_PORT" >/dev/null 2>&1; then
  lsof -ti:"$ANVIL_PORT" | xargs kill >/dev/null 2>&1 || true
  sleep 0.5
fi

anvil --port "$ANVIL_PORT" --silent >"$ANVIL_LOG" 2>&1 &
ANVIL_PID=$!
trap 'kill "$ANVIL_PID" >/dev/null 2>&1 || true' EXIT

# wait until anvil is ready
READY=0
for _ in $(seq 1 30); do
  if cast chain-id --rpc-url "http://127.0.0.1:${ANVIL_PORT}" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 0.5
done

if [[ "$READY" -ne 1 ]]; then
  echo "anvil failed to become ready on port ${ANVIL_PORT}"
  echo "----- anvil log -----"
  sed -n '1,120p' "$ANVIL_LOG" || true
  exit 1
fi

# anvil account[0] private key
export DEPLOYER_PRIVATE_KEY="${DEPLOYER_PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"
export BASE_SEPOLIA_RPC_URL="http://127.0.0.1:${ANVIL_PORT}"

forge script script/DeployAndScenario.s.sol:DeployAndScenarioScript \
  --rpc-url "$BASE_SEPOLIA_RPC_URL" \
  --broadcast \
  -vvvv
