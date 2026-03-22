#!/usr/bin/env bash
set -euo pipefail

is_port_in_use() {
  local port="$1"

  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | grep -E "[:.]${port}[[:space:]]" >/dev/null 2>&1
    return $?
  fi

  if command -v netstat >/dev/null 2>&1; then
    netstat -an 2>/dev/null | grep -E "[:.]${port}[[:space:]]" | grep -i LISTEN >/dev/null 2>&1
    return $?
  fi

  return 1
}

if is_port_in_use 27017; then
  export MONGODB_HOST_PORT="${MONGODB_FALLBACK_HOST_PORT:-27018}"
  echo "Detected an existing MongoDB/port listener on 27017."
  echo "Using internal fallback MongoDB host port ${MONGODB_HOST_PORT} instead."
else
  export MONGODB_HOST_PORT="${MONGODB_HOST_PORT:-27017}"
  echo "Port 27017 is available. Exposing internal fallback MongoDB on ${MONGODB_HOST_PORT}."
fi

echo "Starting stack with MONGODB_HOST_PORT=${MONGODB_HOST_PORT}"
docker-compose up --build "$@"
