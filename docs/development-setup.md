# Development Setup

## Prerequisites

- Node.js 26.x and its bundled npm, verified on Apple Silicon macOS
- Git
- Docker Desktop, with the engine running
- WSL 2 when developing on Windows

## Getting Started

Clone the repository and enter its directory:

```bash
git clone https://github.com/CristianAlexa/stamp-collection-manager.git
cd stamp-collection-manager
npm ci
```

On a fresh clone, copy `.env.example` to `.env`. On macOS:

```bash
cp .env.example .env
```

Preserve an existing local environment file. The Prisma configuration loads
`.env` through `dotenv/config`. Git ignores this file.

The example connection uses the development credentials in `compose.yaml`:

```dotenv
DATABASE_URL="postgresql://stamp_app:stamp_dev_only@127.0.0.1:5433/stamp_collection?schema=public"
```


Start PostgreSQL, generate Prisma Client, apply the existing migrations and populate the development database:

```bash
docker compose up -d db
npx prisma generate
npx prisma migrate deploy
npx prisma migrate status
npm run db:seed
```

The development seed command requires explicit permission through
`ALLOW_DEV_SEED=true`, supplied by the npm script.

The seed populates reusable reference data, sample catalogue
stamps, stamp variations, fictional collectors, personal albums
and collection items.

Seed operations are idempotent and preserve existing database
records rather than resetting the database.

The development seed targets only the explicitly approved local
database configuration. Production seeding is prohibited.


Start the development server:

```bash
npm run dev
```

Open http://localhost:3000, or the local address printed in the terminal.
The database-backed catalogue endpoint is `/api/stamps`.

## Database

PostgreSQL runs in Docker and exposes port 5433 on the local loopback address
`127.0.0.1`. Inside the container, PostgreSQL uses port 5432.

Inspect the service and connect through `psql`:

```bash
docker compose ps db
docker compose port db 5432
docker compose exec db psql -U stamp_app -d stamp_collection
```

At the `psql` prompt, run `\conninfo` to verify the database and user.
Run `\q` to return to your shell.

Database data persists in the named Docker volume. A fresh Docker installation
starts with a fresh database, which migrations and the seed initialize.

For schema changes during development, edit `prisma/schema.prisma`, then run:

```bash
npx prisma migrate dev --config ./prisma7.config.ts --name describe_change
npx prisma generate --config ./prisma7.config.ts
```

Commit the schema and generated migration SQL. Prisma Client is generated
locally in `src/generated/prisma` and is ignored by Git.

## Code Quality

Generate Prisma Client before running checks on a fresh clone:

```bash
npm run lint
npm test
npm run build
npx tsc --noEmit
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

Use the matching local address for API, navigation and theme checks.
Stop the server with Control + C.

Tailwind CSS v4 runs through `@tailwindcss/postcss`, configured in
`postcss.config.mjs`.


## Database Integration Testing

Integration tests use a separate PostgreSQL database, isolated
from the development database.

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

The integration test runner:

1. Starts the isolated PostgreSQL test container.
2. Applies the existing Prisma migrations.
3. Generates Prisma Client.
4. Seeds the test database with development fixtures.
5. Executes automated database and seed safety tests.

The test suite contains:

- 12 database integration tests.
- 7 seed safety tests.

The existing `npm test` command executes four filtering unit tests.

### Database safety

Development seeding requires explicit permission:

```bash
npm run db:seed
```

The underlying seed command rejects execution when permission
is missing or when the database target is not approved.

The integration test runner targets only the local test database.

Never run `docker compose down -v` unless intentionally removing
the stored development and test database volumes.

### Platform compatibility

The integration test runner uses Bash and POSIX-style environment
variable assignments.

It is supported on the project's macOS development environment.
On Windows, run it through WSL or a compatible Bash environment.

Native PowerShell compatibility is a future improvement.

### Testing limitations

Integration tests currently rely on predefined development fixtures.

They verify database queries, missing records, collection statistics
and user-scoped data access.

They do not replace application authentication or request-level
authorisation checks.

Future CRUD integration tests will require isolated fixture
creation and cleanup.
