#!/usr/bin/env bash
set -euo pipefail

# block obvious secret-bearing files from being committed
for pattern in '*.pem' '*.p12' '*.pfx' '*.key' '.env' '.env.*' 'id_rsa' 'id_ed25519'; do
  if git ls-files -- "$pattern" | grep -q .; then
    echo "Policy violation: tracked sensitive file pattern '$pattern'"
    git ls-files -- "$pattern"
    exit 1
  fi
done

echo "Repo policy check passed."
