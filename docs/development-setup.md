# Development Setup

## Prerequisites

- Nde.je
- npm
- Git
- Docker Desktop
  -WSL 2 (Windows)

## Getting Started

1. Clone the GitHub repository.
2. open the project in VS Code.
3. Run "npm install£"
4. Copy ".env.example" to ".env.local".
5. Run "npm dev".
6. Open https://localhost:3000.

## Code Quality

Run the following checks:

- "npx tsc --noEmit"
- "npm run lint"
- "npx prettier --check"

## Database

PostgreSQL and Prisma will be introduced
during the database development phase.
