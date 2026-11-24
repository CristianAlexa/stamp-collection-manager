#!/usr/bin/env bash

# Stop immediately on errors or undefined variables.
set -euo pipefail

# Always run from the repository root.
cd "$(dirname "$0")/.."

# Use a unique temporary database for this execution.
TEST_DB="stamp_migration_test_$$"

echo "Starting isolated PostgreSQL test container..."

docker compose up -d --wait db-test

echo "Creating temporary migration database: $TEST_DB"

docker compose exec -T db-test createdb \
  -U stamp_test \
  "$TEST_DB"

# Only remove the temporary database created by this script.
# Execute cleanup even if a migration or assertion fails.
cleanup() {
  echo "Removing temporary migration database..."

  docker compose exec -T db-test dropdb \
    -U stamp_test \
    --if-exists \
    "$TEST_DB" || {
      echo "WARNING: Temporary database cleanup failed."
      echo "Database name: $TEST_DB"
    }
}

trap cleanup EXIT

# Apply one SQL file to the temporary database.
run_sql() {
  local sql_file="$1"

  docker compose exec -T db-test psql \
    -X \
    -v ON_ERROR_STOP=1 \
    -U stamp_test \
    -d "$TEST_DB" \
    < "$sql_file"
}

# Apply one historical migration.
apply_migration() {
  local migration="$1"

  echo "Applying migration: $migration"

  run_sql "prisma/migrations/$migration/migration.sql"
}

# Reconstruct the database as it existed before Sprint 07.5.
echo "Reconstructing Week 6 database structure..."

apply_migration "20261121000528_create_stamp"
apply_migration "20261121195910_add_users_and_countries"
apply_migration "20261122121117_refactor_catalogue_architecture"
apply_migration "20261122130613_add_reusable_attributes_and_variations"
apply_migration "20261122160343_add_historical_catalogue_valuations"
apply_migration "20261122172523_add_personal_collections_albums_and_images"

# Insert historical records using the original schema.
echo "Creating historical migration fixtures..."

run_sql "tests/migrations/sprint-07-5-before.sql"

# Apply the three Sprint 07.5 migrations.
echo "Applying Sprint 07.5 database refinements..."

apply_migration "20261124203410_add_country_flag_and_description"
apply_migration "20261124204714_simplify_stamp_colours"
apply_migration "20261124210906_simplify_stamp_face_value"

# Assert that historical records were preserved.
echo "Verifying migrated records and database structure..."

run_sql "tests/migrations/sprint-07-5-after.sql"

echo "Migration regression testing completed successfully."