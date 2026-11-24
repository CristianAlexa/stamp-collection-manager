
# Stamp Collection Manager — Technical Debt

## 1. Overview

This document tracks known technical debt, architectural improvements
and outstanding engineering requirements.

Items are reviewed during weekly sprint reviews and prioritised
according to their impact on database integrity, security,
maintainability and production readiness.

## 2. Priority Definitions

| Priority | Description |
|---|---|
| Critical | Must be resolved before production deployment |
| High | Important for integrity, security or reliability |
| Medium | Improves functionality or maintainability |
| Planned | Scheduled future architectural functionality |

## 3. Database Architecture

| ID | Improvement | Priority | Status |
|---|---|---|---|
| DB-001 | Case-insensitive reusable definition uniqueness | High | Open |
| DB-002 | Duplicate variation combination detection | High | Open |
| DB-003 | Country consistency for watermarks and series | High | Open |
| DB-004 | Inherited variation attribute validation | High | Open |
| DB-005 | Detailed partial perforation specifications | Medium | Open |
| DB-006 | Catalogue-specific valuation classifications | Medium | Open |
| DB-007 | Automated database integration tests | High | Completed — Week 07 |

## 4. Authentication and Security

| ID | Improvement | Priority | Status |
|---|---|---|---|
| SEC-001 | Authentication and user-scoped authorisation | Critical | Open |

## 5. Image Management

| ID | Improvement | Priority | Status |
|---|---|---|---|
| IMG-001 | Private image storage and upload validation | High | Open |
| IMG-002 | Image file deletion and orphan cleanup | High | Open |
| IMG-003 | Review multiple front/back image support | Medium | Open |

## 6. Financial Information

| ID | Improvement | Priority | Status |
|---|---|---|---|
| FIN-001 | Currency-aware collection statistics | High | Open |
| FIN-002 | Revisit acquisition modelling | Medium | Open |

## 7. Album Designer

| ID | Improvement | Priority | Status |
|---|---|---|---|
| ALB-001 | Printable album designer architecture | Planned | Planned |

## 8. Technical Debt Summary

| Priority | Count |
|---|---:|
| Critical | 1 |
| High | 8 |
| Medium | 4 |
| Planned | 1 |
| Total | 14 |

## 9. Review Policy

During each sprint review:

- Review existing technical debt items.
- Add newly identified engineering improvements.
- Update priorities when necessary.
- Record completed improvements.
- Identify blockers for upcoming milestones.

Security and ownership requirements must be resolved
before production deployment.

Database integrity improvements should be addressed before
enabling unrestricted shared catalogue editing.

Completed items should retain their original identifiers
for historical traceability.

## 10. Review History

| Sprint | Description |
|---|---|
| Week 06 | Initial technical debt register created |
| Week 07 | Database integration tests completed; new database, API and tooling improvements recorded |

## Related Documentation

- [Database Architecture](./database-architecture.md)
- [Database ERD](./database-erd.md)
- [Development Roadmap](../README.md)


### Additional Database Improvements

| ID | Improvement | Priority | Status |
|---|---|---|---|
| DB-008 | Move catalogue filtering and pagination into PostgreSQL | Medium | Open |
| DB-009 | Isolate integration test fixtures and implement test cleanup for CRUD tests | Medium | Open |
| DB-010 | Separate production reference-data seeding from development sample data | High | Open |

### Additional Application Improvements

| ID | Improvement | Priority | Status |
|---|---|---|---|
| APP-001 | Correct the INVALIDID_YEAR API error code while preserving compatibility | Low | Open |
| APP-002 | Make database testing scripts cross-platform | Low | Open |
