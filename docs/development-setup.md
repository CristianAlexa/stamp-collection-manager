# Development Setup

## Prerequisites

- Node.js 26.x and its bundled npm, verified on Apple Silicon macOS.
- Git.
- Docker Desktop, with the engine running.
- WSL 2 when developing on Windows.

## Getting Started

Clone the repository and enter its directory:

```bash
git clone https://github.com/CristianAlexa/stamp-collection-manager.git
cd stamp-collection-manager
npm ci
```

On a fresh clone, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Preserve an existing local environment file. The Prisma configuration loads `.env` through `dotenv/config`. Git ignores this file.

The example connection uses the development credentials in `compose.yaml`:

```dotenv
DATABASE_URL="postgresql://stamp_app:stamp_dev_only@127.0.0.1:5433/stamp_collection?schema=public"
```

These are local development credentials, not production credentials.

Start PostgreSQL, generate Prisma Client, apply existing migrations and populate the development database:

```bash
docker compose up -d db
npx prisma generate
npx prisma migrate deploy
npx prisma migrate status
npm run db:seed
```

The development seed command requires explicit permission through `ALLOW_DEV_SEED=true`, supplied by the npm script. It populates reusable reference data, sample stamps, variants, fictional collectors, personal albums and collection items. Repeated execution should not create duplicates. Some known sample fields may be updated, so do not assume seeding preserves every manually edited fixture value. Production seeding is prohibited.

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 or the local address printed in the terminal. The database-backed catalogue is available at `/catalogue` and `/api/stamps`.

## Database

PostgreSQL runs in Docker and exposes port 5433 on the local loopback address `127.0.0.1`. Inside the container PostgreSQL uses port 5432.

```bash
docker compose ps db
docker compose port db 5432
docker compose exec db psql -U stamp_app -d stamp_collection
```

At the `psql` prompt, run `\conninfo` to verify the database and user, and `\q` to return to the shell.

Database data persists in a named Docker volume. A fresh Docker installation starts with a fresh database, which migrations and the seed initialise. Sprint 07.5 establishes a baseline of 23 models, six enums and nine migrations.

### Creating database migrations

Before changing populated database columns, create a PostgreSQL backup and verify that it can be restored into an isolated database.

Example local backup (choose a new filename for each backup):

```bash
mkdir -p "$HOME/stamp-db-backups"
docker compose exec -T db pg_dump -U stamp_app -d stamp_collection -Fc \
  > "$HOME/stamp-db-backups/before-schema-change.dump"
docker compose exec -T db pg_restore --list \
  < "$HOME/stamp-db-backups/before-schema-change.dump"
```

Listing an archive does not prove that restoration succeeds. For important changes, perform a test restore into a newly created isolated database and inspect the recovered records.

After editing `prisma/schema.prisma`, generate a migration without applying it:

```bash
npx prisma migrate dev --config ./prisma7.config.ts --name describe_change --create-only
```

Review the generated SQL in `prisma/migrations/`. Transfer data before dropping populated columns or tables, use transactions where appropriate, and include checks for data preservation. Apply the reviewed migration:

```bash
npx prisma migrate dev --config ./prisma7.config.ts
npx prisma generate --config ./prisma7.config.ts
npx prisma migrate status
```

Test fresh installation and populated upgrades. Commit the schema and reviewed migration SQL. Generated Prisma Client files in `src/generated/prisma` are ignored by Git.

Never edit migrations deployed to a shared or production environment. A local-only correction is an exceptional workflow requiring confirmed scope, backups and reconstruction of affected databases. Never manually change checksums to conceal migration inconsistencies. If Prisma unexpectedly requests a development database reset, stop and investigate before accepting it.

See [Sprint 07.5 Migration Review](./sprint-07-5-migration-review.md) for the denomination migration incident and recovery.

## Code Quality

Generate Prisma Client before running checks on a fresh clone. With Docker running, execute:

```bash
npx prisma validate
npx prisma migrate status
npm run lint
npx tsc --noEmit
npm test
npm run test:integration
npm run test:migrations
npm run build
```

The `test:migrations` command is introduced in Sprint 07.5 Step 7. Complete and verify the corresponding test files and npm script before using it.

### Unit tests

The Step 7 target is six filtering tests and nine colour inheritance tests, using Node.js test runner through `tsx`. The filtering and colour suites live in `src/lib/filter-stamps.test.ts` and `src/lib/stamp-colour.test.ts` respectively.

```bash
npm test
```

## Production Build Check

After a successful build, start the production server:

```bash
npm start
```

If another process uses port 3000, choose port 3001:

```bash
npm start -- --port 3001
```

Use the matching local address for API, navigation and theme checks. Stop the server with Control + C. Tailwind CSS v4 runs through `@tailwindcss/postcss`, configured in `postcss.config.mjs`.

## Database Integration Testing

Integration tests use a separate PostgreSQL database, isolated from development.

| Setting | Development | Testing |
|---|---|---|
| Docker service | db | db-test |
| Host port | 5433 | 5434 |
| Database | stamp_collection | stamp_collection_test |
| Database user | stamp_app | stamp_test |

Both databases use separate Docker volumes.

### Running the tests

Start Docker Desktop, then execute:

```bash
npm run test:integration
```

The runner starts the isolated PostgreSQL test container, applies migrations, generates Prisma Client, seeds the approved test database and executes data-access and seed safety tests.

| Test category | Step 7 target |
|---|---:|
| Catalogue filtering unit tests | 6 |
| Colour inheritance unit tests | 9 |
| Database integration tests | 17 |
| Seed safety tests | 7 |
| Total Node.js tests | 39 |
| Separate migration regression assertion groups | 8 |

At the time of this documentation update, Step 6's 36 Node.js tests were reported passing. Step 7's first run reported 13 passing unit tests; two missing filtering tests were identified for restoration. The final 39-test total and eight migration assertion groups remain acceptance targets until verified.

### Database safety

Development seeding requires explicit permission. The seed rejects execution when permission is missing or when the database target is not approved. The integration test runner targets only the local test database.

Never run `docker compose down -v` unless intentionally removing the stored development and test database volumes. If stale integration fixtures require a reset, first confirm that the test database is disposable and the connection points to port 5434 and `stamp_collection_test`. Never reset the development database to repair a test fixture.

### Platform compatibility

The test runners use Bash and POSIX-style environment variable assignments. They are supported on the project's macOS development environment. On Windows, run through WSL or a compatible Bash environment. Native PowerShell compatibility is a future improvement.

### Testing limitations

Integration tests currently rely on predefined development fixtures. They verify database queries, missing records, collection statistics, user-scoped data access, refined catalogue fields and seed restrictions. They do not replace authentication or request-level authorisation checks. Future CRUD integration tests require isolated fixture creation and cleanup.

## Database Migration Regression Testing

Run the Sprint 07.5 regression suite after implementing its files:

```bash
npm run test:migrations
```

The runner (`scripts/run-migration-tests.sh`) uses the isolated `db-test` PostgreSQL container and creates a uniquely named temporary database. It reconstructs the Week 6 schema from migrations 1–6, inserts historical fixtures from `tests/migrations/sprint-07-5-before.sql`, applies migrations 7–9 and executes `tests/migrations/sprint-07-5-after.sql`.

The eight assertion groups verify historical face values, stamp colours, variant colours, removal of obsolete colour tables, country metadata, face value schema, financial currency relationships and the application table count.

The runner is designed to remove only the temporary database at exit, including when a test fails. Check its cleanup output; an interrupted process or cleanup failure may leave a temporary database. Confirm its name before removing any database. Neither the development nor the existing integration database should be modified by the runner.

This suite executes the migration SQL directly. It verifies the historical data transformations and constraints, not Prisma migration bookkeeping. It complements, rather than replaces, Prisma deployment and application integration testing. Its migration list is deliberately fixed to the Sprint 07.5 historical baseline.

## Related Documentation

- [Database Architecture](./database-architecture.md)
- [Database ERD](./database-erd.md)
- [Technical Debt](./technical-debt.md)
- [Sprint 07.5 Migration Review](./sprint-07-5-migration-review.md)
