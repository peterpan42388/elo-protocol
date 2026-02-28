#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${BASE_SEPOLIA_RPC_URL:-}" ]]; then
  echo "BASE_SEPOLIA_RPC_URL is required"
  exit 1
fi

if [[ -z "${DEPLOYER_PRIVATE_KEY:-}" ]]; then
  echo "DEPLOYER_PRIVATE_KEY is required"
  exit 1
fi

if ! command -v forge >/dev/null 2>&1; then
  if [[ -f "$HOME/.zshenv" ]]; then
    # shellcheck source=/dev/null
    source "$HOME/.zshenv"
  fi
fi

VERIFY_ARGS=()
if [[ -n "${BASESCAN_API_KEY:-}" ]]; then
  VERIFY_ARGS=(--verify --etherscan-api-key "$BASESCAN_API_KEY")
fi

forge script script/DeployAndScenario.s.sol:DeployAndScenarioScript \
  --rpc-url "$BASE_SEPOLIA_RPC_URL" \
  --broadcast \
  "${VERIFY_ARGS[@]}" \
  -vvvv
