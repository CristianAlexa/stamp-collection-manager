# Stamp Collection Manager

A personal-first, multi-user-ready stamp collection
management application built with Next.js and TypeScript.

## Project Overview

Stamp Collection Manager helps collectors organise
stamp catalogues, variations, owned stamps and albums.

The application is being developed as a full-stack
learning and portfolio project.

## Planned Features

- Stamp catalogue with country and year information
- Multiple catalogue references (SG, Scott, Michel, etc.)
- Stamp variations and plate numbers
- Personal collection and duplicate tracking
- Albums and nested sub-albums
- Multiple stamp images
- CSV import and export
- Advanced search and filtering
- Printable album page designer
- Responsive and installable PWA

## Technology Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Docker

## Getting Started

### Prerequisites

- Node.js compatible with installed Next.js version
- npm

### Installation

Follow the [Development Setup](docs/development-setup.md) guide to install
locked dependencies, configure `.env`, start PostgreSQL, generate Prisma Client,
apply migrations and seed the sample catalogue. Then run `npm run dev`
and open the local address printed by Next.js.

### Code Quality

Run TypeScript checks:

    npx tsc --noEmit

Run ESLint:

    npm run lint

Checking formatting:

    npx prettier --check .

## Architecture

The application separates catalogue stamp records
from physical stamps owned by collectors.

User-owned data will be associated with an account,
allowing future multi-user support.

## Development Status

The application, relational database and data access foundations are implemented. Sprint 07.5 refines country metadata, stamp colours and printed face values while preserving financial currency relationships.

- 23 Prisma models, six enums and nine database migrations.
- 15 unit tests, 17 database integration tests and seven seed safety tests.
- Eight separate SQL migration regression assertion groups.
- All 39 Node.js tests and eight SQL assertion groups passed locally on 25 November 2026.

The next scheduled sprint is Week 8. Authentication, authorisation and other production requirements remain outstanding.

## Database Documentation

- [Database Architecture](docs/database-architecture.md)
- [Database ERD](docs/database-erd.md)
- [Development Setup](docs/development-setup.md)
- [Technical Debt](docs/technical-debt.md)
- [Sprint 07.5 Migration Review](docs/sprint-07-5-migration-review.md)
- [Sprint 07.5 Review](docs/sprint-07-5-review.md)

## Roadmap

The initial release focuses on personal collection
management. Public registration, hosting and native
mobile application are planned for later phase.

## Author

Developed as a full-stack software engineering
learning and portfolio project.

See [Development Setup](docs/development-setup.md)
for local installation instructions
