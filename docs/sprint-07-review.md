# Sprint 07 Review — Database Seeding and Data Access

## 1. Sprint Overview

**Project:** Stamp Collection Manager v3.0  
**Sprint:** Week 07 of 36  
**Duration:** Seven learning days  
**Status:** Completed — 56/56 acceptance criteria confirmed by the developer; PR #26 merge independently verified on GitHub.  
**MVP milestone:** Week 24  
**Release milestone:** Week 36

### Sprint Goal

Implement a maintainable database seeding architecture, establish a reusable Prisma Data Access Layer and verify database behaviour through automated integration testing.

This is a historical Week 7 review. Its database and test counts describe that sprint, before the refinements in Sprint 07.5.

## 2. Completed Deliverables

### Day 1 — Database Seed Foundation

- Reviewed the existing Prisma seed implementation.
- Added a reusable npm seed command.
- Verified idempotent operations.
- Confirmed database record counts.
- Preserved existing database records.

### Day 2 — Modular Seed Architecture

- Extracted structured reference data.
- Created reusable reference-data seed functions.
- Separated stamp seeding from database orchestration.
- Preserved transactional execution.
- Introduced Prisma-generated TypeScript types.

### Day 3 — Relational Catalogue Seeding

- Added reusable stamp colours and perforations.
- Enriched the Penny Black record.
- Created a separate numbered-plate Penny Red issue.
- Added Stanley Gibbons catalogue references.
- Created plate 71 and plate 72 variations.
- Verified relational constraints and repeatability.

### Day 4 — Personal Collection Seeding

- Created two fictional development collectors.
- Created three personal albums.
- Seeded seven individually owned stamps.
- Supported allocated and unallocated items.
- Verified album ownership constraints.
- Verified stamp and variation consistency.

### Day 5 — Data Access Layer

- Created server-only reusable catalogue queries.
- Implemented detailed stamp retrieval.
- Added user-scoped album queries.
- Added personal collection queries.
- Added unallocated item retrieval.
- Added database-backed collection statistics.
- Refactored the stamp API to use the DAL.
- Verified query behaviour and user scoping.

### Day 6 — Integration Testing and Seed Safety

- Introduced a separate PostgreSQL test container.
- Applied existing migrations to the test database.
- Implemented explicit development seed permission.
- Added database target validation.
- Added 12 database integration tests.
- Added 7 seed safety tests.
- Implemented a reusable integration test command.
- Verified development and test database isolation.

### Day 7 — Sprint Review and Merge Readiness

All eight Day 7 acceptance criteria were reported passing by the developer. The full Week 7 implementation and review acceptance total is 56 of 56. Pull request #26 and its merge commit have been independently verified on GitHub.

## 3. Architecture

The application follows this database access structure:

1. Next.js pages and API routes.
2. Server-only Data Access Layer.
3. Shared Prisma Client.
4. PostgreSQL database.

Development data is created using modular seed functions executed inside a database transaction. The test environment uses a separate PostgreSQL container, database and Docker volume.

## 4. Database Summary

Historical Week 7 baseline:

- Prisma models: 26.
- Enums: 6.
- Database migrations: 6.
- Shared catalogue stamps: 4.
- Development collectors introduced this sprint: 2.
- Personal albums: 3.
- Collection items: 7.
- Stamp variations introduced this sprint: 2.

Additional development records may exist from earlier lessons. The development database must not be reset solely to match the isolated test fixture counts.

## 5. Testing Summary

| Test category | Tests |
|---|---:|
| Filtering unit tests | 4 |
| Database integration tests | 12 |
| Seed safety tests | 7 |
| Total | 23 |

All 23 automated tests were reported passing during Week 07.

Additional quality checks included Prisma schema validation, migration status verification, ESLint, TypeScript compilation, Next.js production build, repeatable database seeding, API filtering checks and database isolation checks.

## 6. Security and Data Integrity

Implemented:

- Server-only database access.
- User-scoped collection queries.
- Compound foreign key ownership constraints.
- Explicit development seed permission.
- Local database target restrictions.
- Isolated database integration testing.

Not yet implemented:

- Application authentication.
- Verified session-based authorisation.
- Production database access controls.
- Complete CRUD test isolation.

User-scoped queries provide necessary groundwork but are not a substitute for authentication or authorisation.

## 7. Issues and Resolutions

### Seed Orchestrator File Correction

During development, API route code was accidentally placed in `prisma/seed.ts`. The seed orchestrator was restored, and the API route was updated to use the Data Access Layer.

### TypeScript Test Environment Error

The seed safety test helper encountered a read-only NODE_ENV typing error. The test helper was corrected without weakening project-wide TypeScript checks.

### Additional Development User

An additional Test Collector record was present in the development database. The record was preserved. It does not belong to the controlled integration test fixture set.

## 8. Technical Debt

- DB-007 completed.
- DB-008 database filtering and pagination.
- DB-009 integration test fixture isolation.
- DB-010 production-safe reference data seeding.
- APP-001 API validation error code correction.
- APP-002 cross-platform database test tooling.

Refer to [Technical Debt](./technical-debt.md) for the current register.

## 9. Sprint Acceptance

- Days completed: 7 of 7, as confirmed by the developer.
- Implementation acceptance criteria passed: 48 of 48.
- Day 7 review criteria: 8 of 8, developer confirmed.
- Final sprint acceptance: 56 of 56, developer confirmed.

## 10. Next Sprint

Sprint 07.5 — Database Refinement is inserted before Week 08 to refine country metadata, free-text colours and printed face value representation. Week 08 will build on the completed database foundations; priorities should be confirmed against the Master Roadmap before starting.

The Week 24 MVP and Week 36 release targets remain unchanged. See [Sprint 07.5 Migration Review](./sprint-07-5-migration-review.md) for the subsequent architecture changes. The historical Week 7 counts above are intentionally not replaced by Sprint 07.5 counts.

## 11. Merge Record

- Feature branch: `feature/week-07-database-seeding`.
- Pull request: [#26](https://github.com/CristianAlexa/stamp-collection-manager/pull/26).
- Merge commit: `9cd39a20ac7d1af30b56d6618f44495b0bc040c6`.
- Merged: 24 November 2026, 20:17:33 UTC.
- Final acceptance verification: developer confirmed 56/56; merge metadata independently verified.

This historical record retains the Week 7 architecture and test counts; Sprint 07.5 refinements are documented separately.
