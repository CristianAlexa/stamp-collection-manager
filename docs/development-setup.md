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

Start PostgreSQL, generate Prisma Client, apply committed migrations and seed
the sample catalogue:

```bash
docker compose up -d db
npx prisma generate --config ./prisma7.config.ts
npx prisma migrate deploy --config ./prisma7.config.ts
npx prisma migrate status --config ./prisma7.config.ts
npx prisma db seed --config ./prisma7.config.ts
npx tsx scripts/check-stamps.ts
```

The seed creates three sample stamps with stable IDs. Repeated runs preserve
existing records and add any missing samples.

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
