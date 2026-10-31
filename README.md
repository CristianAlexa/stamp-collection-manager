# Stamp Collection Manager

A personal-first, multi-user-ready stamp collection
management application build with Next.js and TypeScript.

## Project Overview

Stamp Collection Manager helps collectors organise
stamp catalogues, variations, owned stamps and albums.

The application is being developed as a full-stack
learning and portfolio project.

## Planed Features

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

- Nest.js (App Router)
- React
- TypeScript
- Tailwind CSS
- PostgreSQL (planned)
- Prisma ORM (planned)
- Docker

## Getting Started

### Prerequisites

- Node.js compatible with installed Next.js version
- npm

### Installation

Clone the repository and install dependencies:

    npm install

Start the development server:

    npm run dev

Open https:localhost:300 in your browser.

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

## Development status

Early development - Foundation phase.

## Roadmap

The initial release focuses on personal collection
management. Public registration, hosting and native
mobile application are planned for later phase.

## Author

Developed as a full-stack software engineering
learning and portfolio project.
