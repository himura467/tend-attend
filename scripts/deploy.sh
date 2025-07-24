#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <environment>"
  exit 1
fi

ROOT_DIR=$(cd "$(dirname "$0")"/..; pwd)

# Build backend image to ensure latest code is deployed
echo "Building backend image..."
"$ROOT_DIR/scripts/build_backend.sh"

cd "$ROOT_DIR/terraform/environments/$1"

OP_VAULT_NAME='Tend Attend' OP_APP_ENV='Production' op run --env-file "$ROOT_DIR/terraform/provider.env" -- terraform init
OP_VAULT_NAME='Tend Attend' OP_APP_ENV='Production' op run --env-file "$ROOT_DIR/terraform/provider.env" -- terraform apply
