#!/usr/bin/env bash

# Stop execution immediately if a command fails.
set -euo pipefail

# Explicitly target the isolated test database.
export DATABASE_URL="postgresql://stamp_test:stamp_test_only@127.0.0.1:5434/stamp_collection_test?schema=public"

export NODE_ENV=test
export ALLOW_DEV_SEED=true
export ALLOW_DEV_MUTATIONS=true

echo "Starting isolated PostgreSQL test database..."

docker compose up -d --wait db-test

echo "Applying database migrations..."

npx prisma migrate deploy

echo "Generating Prisma Client..."

npx prisma generate

echo "Preparing integration test fixtures..."

npx prisma db seed

echo "Running database integration tests..."


node --conditions=react-server \
  --import tsx \
  --test-concurrency=1 \
  --test tests/integration/data-access.test.ts \
  tests/integration/catalogue-create.test.ts \
  tests/integration/catalogue-update.test.ts \
  tests/integration/seed-safety.test.ts


echo "Integration testing completed."