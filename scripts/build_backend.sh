#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")"/..; pwd)

PYTHON_VERSION=$(cat "$ROOT_DIR/backend/.python-version")
rm -f backend-python.zip backend.zip backend-dependencies.zip
source "$ROOT_DIR/scripts/export_requirements.sh"
docker build -f "$ROOT_DIR/docker/backend/Dockerfile" \
  --build-arg PYTHON_VERSION="$PYTHON_VERSION" \
  --platform linux/amd64 \
  --no-cache \
  --provenance=false \
  -t tend-attend-backend:latest "$ROOT_DIR" --progress=plain
BACKEND_CONTAINER_ID=$(docker create --platform linux/amd64 tend-attend-backend:latest)
docker cp "$BACKEND_CONTAINER_ID":/python "$ROOT_DIR"
docker cp "$BACKEND_CONTAINER_ID":/main.py "$ROOT_DIR"
docker cp "$BACKEND_CONTAINER_ID":/dependencies "$ROOT_DIR"
docker rm -v "$BACKEND_CONTAINER_ID"
zip -r -X backend-python.zip python/ -x '*/__pycache__/*'
zip -r -X backend.zip main.py
cd dependencies && zip -r -X ../backend-dependencies.zip python/ -x '*/__pycache__/*' && cd ..
rm -rf "$ROOT_DIR/python" "$ROOT_DIR/main.py" "$ROOT_DIR/dependencies" "$ROOT_DIR/requirements.txt"
