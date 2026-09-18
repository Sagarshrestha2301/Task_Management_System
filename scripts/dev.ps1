#!/usr/bin/env bash
# Start the full development stack
set -e
echo "Starting PostgreSQL..."
docker compose up -d
echo "Waiting for PostgreSQL..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U postgres 2>/dev/null; then
    break
  fi
  echo "  Waiting... ($i)"
  sleep 2
done
echo "PostgreSQL is ready."
