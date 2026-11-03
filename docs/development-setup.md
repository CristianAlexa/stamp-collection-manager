# Development Setup

## Prerequisites

- Node.js
- npm
- Git
- Docker Desktop
- WSL 2 (Windows)

## Getting Started

1. Clone the GitHub repository.
2. Open the project in VS Code.
3. Run npm install
4. Copy .env.example to .env.local.
5. Run npm dev.
6. Open https://localhost:3000.

## Code Quality

Run the following checks:

- npx tsc --noEmit
- npm run lint
- npx prettier --check

## Database

Start the local PostgreSQL service from the repository root:

```powershell
docker compose up -d db
docker compose ps db
docker compose exec db psql -U stamp_app -d stamp_collection
```

At the `psql` prompt, run `\conninfo` to verify the database and user.
Run `\q` to return to your shell.

The Compose service uses development-only credentials and publishes no
host port. PostgreSQL data is stored in a named Docker volume. Prisma
integration is planned for a later phase.
