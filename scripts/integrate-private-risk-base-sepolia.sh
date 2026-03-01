#!/usr/bin/env bash
set -euo pipefail

PUBLIC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PRIVATE_DIR="${PRIVATE_RISK_REPO_DIR:-$(cd "$PUBLIC_DIR/../elo-risk-extension" && pwd)}"

if [[ -z "${BASE_SEPOLIA_RPC_URL:-}" ]]; then
  echo "BASE_SEPOLIA_RPC_URL is required"
  exit 1
fi

if [[ -z "${DEPLOYER_PRIVATE_KEY:-}" ]]; then
  echo "DEPLOYER_PRIVATE_KEY is required"
  exit 1
fi

if [[ ! -d "$PRIVATE_DIR" ]]; then
  echo "private risk repo not found: $PRIVATE_DIR"
  exit 1
fi

if ! command -v forge >/dev/null 2>&1 || ! command -v jq >/dev/null 2>&1; then
  if [[ -f "$HOME/.zshenv" ]]; then
    # shellcheck source=/dev/null
    source "$HOME/.zshenv"
  fi
fi

export PROVIDER_ADDR="${PROVIDER_ADDR:-0x1000000000000000000000000000000000001001}"
export CONSUMER_ADDR="${CONSUMER_ADDR:-$(cast wallet address --private-key "$DEPLOYER_PRIVATE_KEY")}" 

echo "[1/4] Deploy ELO core to Base Sepolia"
(
  cd "$PUBLIC_DIR"
  forge script script/DeployCoreOnly.s.sol:DeployCoreOnlyScript --rpc-url "$BASE_SEPOLIA_RPC_URL" --broadcast -vvvv
)

CORE_BROADCAST="$PUBLIC_DIR/broadcast/DeployCoreOnly.s.sol/84532/run-latest.json"
SETTLEMENT_ENGINE_ADDR="$(jq -r '.transactions[] | select(.transactionType=="CREATE" and .contractName=="SettlementEngine") | .contractAddress' "$CORE_BROADCAST" | tail -n1)"
ELO_ADDR="$(jq -r '.transactions[] | select(.transactionType=="CREATE" and .contractName=="ELOToken") | .contractAddress' "$CORE_BROADCAST" | tail -n1)"
OWNER_REGISTRY_ADDR="$(jq -r '.transactions[] | select(.transactionType=="CREATE" and .contractName=="OwnerRegistry") | .contractAddress' "$CORE_BROADCAST" | tail -n1)"

if [[ -z "$SETTLEMENT_ENGINE_ADDR" || "$SETTLEMENT_ENGINE_ADDR" == "null" ]]; then
  echo "failed to parse settlement address"
  exit 1
fi

echo "[2/4] Deploy private AdaptiveRiskPolicy to Base Sepolia"
(
  cd "$PRIVATE_DIR"
  export SETTLEMENT_ENGINE_ADDR
  forge script script/DeployAdaptiveRiskPolicy.s.sol:DeployAdaptiveRiskPolicyScript --rpc-url "$BASE_SEPOLIA_RPC_URL" --broadcast -vvvv
)

RISK_BROADCAST="$PRIVATE_DIR/broadcast/DeployAdaptiveRiskPolicy.s.sol/84532/run-latest.json"
RISK_POLICY_ADDR="$(jq -r '.transactions[] | select(.transactionType=="CREATE" and .contractName=="AdaptiveRiskPolicy") | .contractAddress' "$RISK_BROADCAST" | tail -n1)"

if [[ -z "$RISK_POLICY_ADDR" || "$RISK_POLICY_ADDR" == "null" ]]; then
  echo "failed to parse risk policy address"
  exit 1
fi

echo "[3/4] Attach risk policy"
(
  cd "$PUBLIC_DIR"
  export SETTLEMENT_ENGINE_ADDR
  export RISK_POLICY_ADDR
  forge script script/SetRiskPolicy.s.sol:SetRiskPolicyScript --rpc-url "$BASE_SEPOLIA_RPC_URL" --broadcast -vvvv
)

echo "[4/4] Verify integration scenario"
(
  cd "$PUBLIC_DIR"
  export SETTLEMENT_ENGINE_ADDR
  export RISK_POLICY_ADDR
  # Scenario includes one intentionally denied settlement; skip pre-simulation to avoid false negatives.
  forge script script/VerifyRiskIntegrationScenario.s.sol:VerifyRiskIntegrationScenarioScript --rpc-url "$BASE_SEPOLIA_RPC_URL" --broadcast --skip-simulation -vvvv
)

echo "Integration complete on Base Sepolia"
echo "OWNER_REGISTRY_ADDR=$OWNER_REGISTRY_ADDR"
echo "ELO_ADDR=$ELO_ADDR"
echo "SETTLEMENT_ENGINE_ADDR=$SETTLEMENT_ENGINE_ADDR"
echo "RISK_POLICY_ADDR=$RISK_POLICY_ADDR"
