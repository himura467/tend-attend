#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")"/..; pwd)

uv export --format requirements.txt -o requirements.txt --no-dev --no-hashes
