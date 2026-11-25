# Stamp Collection Manager — Technical Debt

## 1. Overview

This document tracks known technical debt, architectural improvements and outstanding engineering requirements. Items are reviewed during weekly sprint reviews and prioritised according to their impact on database integrity, security, maintainability and production readiness.

## 2. Priority Definitions

| Priority | Description |
|---|---|
| Critical | Must be resolved before production deployment |
| High | Important for integrity, security or reliability |
| Medium | Improves functionality or maintainability |
| Low | Lower-impact tooling or compatibility improvements |
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
| DB-008 | Move catalogue filtering and pagination into PostgreSQL | Medium | Open |
| DB-009 | Isolate integration test fixtures and implement test cleanup for CRUD tests | Medium | Open |
| DB-010 | Separate production reference-data seeding from development sample data | High | Open |

### Sprint 07.5 database review

DB-001 remains applicable to reusable definitions other than the removed colour library. DB-004 remains open: colour inheritance is implemented, but broader inherited variation attribute validation remains necessary. DB-009 remains open despite isolated migration regression fixtures; CRUD fixture isolation is a different requirement.

### Face Value Migration Data Preservation

- **Status:** Resolved — Step 5, as confirmed by the developer.
- **Identified:** Sprint 07.5, Step 4.
- **Priority:** High.
- **Issue:** The generated migration removed denomination and currency information without transferring it to the new text field.
- **Resolution:** Recovered the original printed denominations, removed the duplicate unapplied migration, implemented a transactional data-preserving migration, verified populated upgrades and fresh installations, and reconstructed affected local databases.
- **Prevention:** Review SQL before applying destructive changes; verify backups; test both fresh installations and populated upgrades; preserve shared migration history.
- **Follow-up:** Automated regression protection in Step 7 (`npm run test:migrations`) covers historical denomination and colour transformations. All eight assertion groups passed on 25 November 2026, as evidenced by the supplied local terminal output.

Retain the original local identifier for this resolved incident if one was already assigned in Step 5. The published baseline did not contain that identifier, so this entry does not invent a replacement.

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

FIN-001 should preserve original amounts and currencies and account for future user display-currency preferences and currency conversion. No conversion system was introduced by Sprint 07.5.

## 7. Album Designer

| ID | Improvement | Priority | Status |
|---|---|---|---|
| ALB-001 | Printable album designer architecture | Planned | Planned |

## 8. Application Improvements

| ID | Improvement | Priority | Status |
|---|---|---|---|
| APP-001 | Correct the INVALIDID_YEAR API error code while preserving compatibility | Low | Open |
| APP-002 | Make database testing scripts cross-platform | Low | Open |

### Planned colour autocomplete and search

Provide optional colour suggestions without enforcing a fixed colour library. Priority: Medium. Status: Planned. Assign the next available application identifier after comparing this document with the local register.

Country flag rendering and dedicated country management are deferred to future feature work. Validate externally supplied flag URLs before rendering. Dedicated face value and colour filters are also deferred.

## 9. Technical Debt Summary

The published baseline contains 19 numbered items, including completed items. The following counts cover those items plus the two Sprint 07.5 entries described above, each counted once. Reconcile any additional local items before treating this as the final register.

| Priority | Open | Planned | Completed / resolved | Total |
|---|---:|---:|---:|---:|
| Critical | 1 | 0 | 0 | 1 |
| High | 8 | 0 | 2 | 10 |
| Medium | 6 | 1 | 0 | 7 |
| Low | 2 | 0 | 0 | 2 |
| Planned | 0 | 1 | 0 | 1 |
| Total | 17 | 2 | 2 | 21 |

## 10. Review Policy

During each sprint review, review existing items, add newly identified engineering improvements, update priorities where necessary, record completed improvements and identify blockers for upcoming milestones.

Security and ownership requirements must be resolved before production deployment. Database integrity improvements should be addressed before unrestricted shared catalogue editing. Completed items retain their original identifiers for historical traceability.

## 11. Review History

| Sprint | Description |
|---|---|
| Week 06 | Initial technical debt register created |
| Week 07 | Database integration tests completed; database, API and tooling improvements recorded |
| Sprint 07.5 | Simplified catalogue attributes; resolved the face value migration incident; implemented and locally verified automated migration regression coverage; colour autocomplete remains planned |

## Related Documentation

- [Database Architecture](./database-architecture.md)
- [Database ERD](./database-erd.md)
- [Sprint 07.5 Migration Review](./sprint-07-5-migration-review.md)
- [Development Roadmap](../README.md)
