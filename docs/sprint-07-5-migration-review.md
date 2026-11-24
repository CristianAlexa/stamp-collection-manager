# Sprint 07.5 — Database Migration Review

## 1. Overview

**Project:** Stamp Collection Manager v3.0  
**Sprint:** 07.5 — Database Refinement  
**Status:** Migration review completed (Step 5 confirmed); automated regression suite validation and final sprint merge pending.  
**Database:** PostgreSQL 16 / Prisma 7

The refined architecture contains 23 Prisma models, six enums and nine migrations. Sprint 07.5 is an intermediate refinement sprint; the Week 24 MVP and Week 36 production release milestones remain unchanged.

## 2. Database Refinements

- Country: optional `flagUrl` and `description` text fields.
- Stamp and StampVariant: optional `colour` text fields replace the three normalised colour models.
- Stamp: optional `faceValue` text replaces the numeric face value, separate denomination and stamp currency relationship.
- Currency: retained for catalogue valuations, purchase currency and market valuation currency.

## 3. Migration History

| No. | Migration |
|---:|---|
| 1 | `20261121000528_create_stamp` |
| 2 | `20261121195910_add_users_and_countries` |
| 3 | `20261122121117_refactor_catalogue_architecture` |
| 4 | `20261122130613_add_reusable_attributes_and_variations` |
| 5 | `20261122160343_add_historical_catalogue_valuations` |
| 6 | `20261122172523_add_personal_collections_albums_and_images` |
| 7 | `20261124203410_add_country_flag_and_description` |
| 8 | `20261124204714_simplify_stamp_colours` |
| 9 | `20261124210906_simplify_stamp_face_value` |

## 4. Migration Incident

The initial face value migration dropped `Stamp.denomination` and `Stamp.currencyId` without transferring their information. It converted the numeric `faceValue` directly into text, leaving Penny Black and the numbered-plate Penny Red with `1.000000` rather than `1d`.

An additional migration (`20261124210935_simplify_stamp_face_value`) attempted to access the removed columns and failed shadow database validation (P3006/P3018). It was never applied to the development database and was moved outside the repository.

The developer confirmed that the original ninth migration was applied only to local development and integration test databases. This allowed a controlled correction before publishing, without modifying a previously shared or production migration.

## 5. Recovery and Correction

1. Created backups before the refinements and recovery.
2. Restored the pre-face-value archive into a separate recovery database and verified the original denominations.
3. Recovered the two affected face values in development and removed the unapplied duplicate migration.
4. Replaced the local-only destructive migration with transactional SQL that transfers data before removing the old fields.
5. Tested the corrected migration in an isolated populated database using the four original catalogue stamps and six additional fixtures.
6. Reconstructed the development database from the pre-face-value backup, applied the corrected migration, compared data, and retained the previous database under `stamp_collection_pre_correction`.
7. Verified Prisma migration history and checksum, fresh installation and schema consistency, as confirmed in Step 5.
8. Rebuilt the disposable integration test database. A later Step 6 integration test exposed a stale `1.000000` Penny Red value; rebuilding again resolved the test failure, with all 24 integration and seed safety tests reported passing.

No manual alteration of the Prisma migration checksum was required. No development database was deleted during reconciliation.

## 6. Transformation Rules

### Face value

1. Preserve the original nonblank printed denomination exactly.
2. Otherwise, preserve the numeric value and original currency code as text, using `TRIM_SCALE` for the numeric value.
3. Preserve a numeric-only value defensively if such a record is encountered (the old constraint normally required a currency for numeric values).
4. Preserve a currency-only code if the old numeric value is absent.
5. Retain NULL when no meaningful information exists.

A valid printed denomination takes priority over redundant numeric and currency data. The migration does not preserve a separate copy of those redundant fields in the new schema. The old numeric face value check, currency foreign key and index are removed; the new field is nullable text.

### Colour

Linked colour names are transferred into nullable text fields; multiple names are sorted alphabetically and joined with a comma and space. A missing variant colour is not materialised from the parent: inheritance is resolved by the application. Unused colour definitions, descriptions and hex codes are retired from the active schema, with the original backup retained.

## 7. Validation Record

| Validation | Status |
|---|---|
| Populated face value upgrade including six additional fixtures | Passed — developer confirmed |
| Original development data comparison and preservation | Passed — developer confirmed |
| Nine migration history and checksum checks | Passed — developer confirmed |
| Fresh database deployment and schema comparison | Passed — developer confirmed |
| Prisma schema validation and migration drift check | Passed — terminal output supplied |
| Step 6 integration and seed safety tests | 24/24 passed — developer confirmed |
| Step 7 historical regression suite | Pending execution confirmation |
| Final sprint quality checks and merge | Pending |

### Planned repeatable historical regression suite (Step 7)

`npm run test:migrations` reconstructs the first six migrations in a temporary database inside the test container, inserts historical fixtures, applies the three refinement migrations and checks eight assertion groups. It validates data transformation SQL independently from Prisma migration bookkeeping.

The fixtures cover eight denomination scenarios (including missing and whitespace-only denominations), multiple linked colours, absent and explicit variant colour overrides, country metadata, obsolete tables and columns, currency relationships and the expected 23-table baseline.

The runner should remove its temporary database on exit. Confirm actual execution and cleanup before recording Step 7 as passed.

## 8. Local Recovery Resources

Local archives were created under `$HOME/stamp-db-backups/`, including:

- `before-sprint-07-5.dump`
- `before-colour-refinement.dump`
- `before-face-value-refinement.dump`
- `before-face-value-recovery.dump`
- `before-migration-review.dump`
- `before-migration-correction.dump`
- `original-face-value-migration.sql`

Review which archives and temporary databases exist locally before cleanup. Keep the verified pre-refinement backups and do not delete or reset `stamp_collection`. Recovery resources are local operational assets, not files to commit to Git.

## 9. Migration Policy

- Review generated SQL using `--create-only` before application.
- Create backups and verify restoration before destructive changes.
- Transfer populated data before dropping source fields.
- Test empty installations and populated upgrades.
- Use transactional transformations and explicit assertions where appropriate.
- Never rewrite migrations deployed to shared or production environments.
- Treat correction of a local-only migration as an exceptional, controlled reconstruction exercise.
- Never edit migration checksums manually to conceal inconsistency.

## 10. Conclusion

The corrected ninth migration and reconciled development database passed Step 5, as confirmed by the developer. Step 7 adds repeatable protection against the historical denomination and colour data-loss scenarios. Final regression execution, documentation review and merge remain subject to the outstanding sprint acceptance checks.
