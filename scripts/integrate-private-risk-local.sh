#!/usr/bin/env bash
set -euo pipefail

PUBLIC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PRIVATE_DIR="${PRIVATE_RISK_REPO_DIR:-$(cd "$PUBLIC_DIR/../elo-risk-extension" && pwd)}"

if [[ ! -d "$PRIVATE_DIR" ]]; then
  echo "private risk repo not found: $PRIVATE_DIR"
  exit 1
fi

if ! command -v forge >/dev/null 2>&1 || ! command -v anvil >/dev/null 2>&1 || ! command -v jq >/dev/null 2>&1; then
  if [[ -f "$HOME/.zshenv" ]]; then
    # shellcheck source=/dev/null
    source "$HOME/.zshenv"
  fi
fi

export NO_PROXY="127.0.0.1,localhost"
export no_proxy="127.0.0.1,localhost"

ANVIL_PORT="${ANVIL_PORT:-8545}"
ANVIL_LOG="${ANVIL_LOG:-/tmp/elo-risk-integration-anvil.log}"
RPC_URL="http://127.0.0.1:${ANVIL_PORT}"

if lsof -ti:"$ANVIL_PORT" >/dev/null 2>&1; then
  lsof -ti:"$ANVIL_PORT" | xargs kill >/dev/null 2>&1 || true
  sleep 0.5
fi

anvil --port "$ANVIL_PORT" --silent >"$ANVIL_LOG" 2>&1 &
ANVIL_PID=$!
trap 'kill "$ANVIL_PID" >/dev/null 2>&1 || true' EXIT

READY=0
for _ in $(seq 1 40); do
  if cast chain-id --rpc-url "$RPC_URL" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 0.5
done

if [[ "$READY" -ne 1 ]]; then
  echo "anvil not ready"
  sed -n '1,120p' "$ANVIL_LOG" || true
  exit 1
fi

export DEPLOYER_PRIVATE_KEY="${DEPLOYER_PRIVATE_KEY:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"
export PROVIDER_ADDR="${PROVIDER_ADDR:-0x1000000000000000000000000000000000001001}"
export CONSUMER_ADDR="${CONSUMER_ADDR:-$(cast wallet address --private-key "$DEPLOYER_PRIVATE_KEY")}" 

echo "[1/4] Deploy ELO core"
(
  cd "$PUBLIC_DIR"
  forge script script/DeployCoreOnly.s.sol:DeployCoreOnlyScript --rpc-url "$RPC_URL" --broadcast -vvvv
)

CORE_BROADCAST="$PUBLIC_DIR/broadcast/DeployCoreOnly.s.sol/31337/run-latest.json"
SETTLEMENT_ENGINE_ADDR="$(jq -r '.transactions[] | select(.transactionType=="CREATE" and .contractName=="SettlementEngine") | .contractAddress' "$CORE_BROADCAST" | tail -n1)"
ELO_ADDR="$(jq -r '.transactions[] | select(.transactionType=="CREATE" and .contractName=="ELOToken") | .contractAddress' "$CORE_BROADCAST" | tail -n1)"
OWNER_REGISTRY_ADDR="$(jq -r '.transactions[] | select(.transactionType=="CREATE" and .contractName=="OwnerRegistry") | .contractAddress' "$CORE_BROADCAST" | tail -n1)"

if [[ -z "$SETTLEMENT_ENGINE_ADDR" || "$SETTLEMENT_ENGINE_ADDR" == "null" ]]; then
  echo "failed to parse settlement address"
  exit 1
fi

echo "[2/4] Deploy private AdaptiveRiskPolicy"
(
  cd "$PRIVATE_DIR"
  export SETTLEMENT_ENGINE_ADDR
  forge script script/DeployAdaptiveRiskPolicy.s.sol:DeployAdaptiveRiskPolicyScript --rpc-url "$RPC_URL" --broadcast -vvvv
)

RISK_BROADCAST="$PRIVATE_DIR/broadcast/DeployAdaptiveRiskPolicy.s.sol/31337/run-latest.json"
RISK_POLICY_ADDR="$(jq -r '.transactions[] | select(.transactionType=="CREATE" and .contractName=="AdaptiveRiskPolicy") | .contractAddress' "$RISK_BROADCAST" | tail -n1)"

if [[ -z "$RISK_POLICY_ADDR" || "$RISK_POLICY_ADDR" == "null" ]]; then
  echo "failed to parse risk policy address"
  exit 1
fi

echo "[3/4] Attach risk policy to SettlementEngine"
(
  cd "$PUBLIC_DIR"
  export SETTLEMENT_ENGINE_ADDR
  export RISK_POLICY_ADDR
  forge script script/SetRiskPolicy.s.sol:SetRiskPolicyScript --rpc-url "$RPC_URL" --broadcast -vvvv
)

echo "[4/4] Run integration scenario"
(
  cd "$PUBLIC_DIR"
  export SETTLEMENT_ENGINE_ADDR
  export RISK_POLICY_ADDR
  # Scenario includes one intentionally denied settlement; skip pre-simulation to avoid false negatives.
  forge script script/VerifyRiskIntegrationScenario.s.sol:VerifyRiskIntegrationScenarioScript --rpc-url "$RPC_URL" --broadcast --skip-simulation -vvvv
)

echo "Integration complete"
echo "OWNER_REGISTRY_ADDR=$OWNER_REGISTRY_ADDR"
echo "ELO_ADDR=$ELO_ADDR"
echo "SETTLEMENT_ENGINE_ADDR=$SETTLEMENT_ENGINE_ADDR"
echo "RISK_POLICY_ADDR=$RISK_POLICY_ADDR"
