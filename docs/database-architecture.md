# Stamp Collection Manager — Database Architecture v3.0

## 1. Overview

Stamp Collection Manager is a personal-first, multi-user-ready philatelic collection management application.

The database separates three distinct areas:

- Shared stamp catalogue information.
- Individual physical stamp ownership.
- Future printable album layouts.

This separation allows collectors to manage their personal collections without duplicating shared catalogue information. The Week 6 relational foundation was refined in Sprint 07.5 to better represent philatelic terminology and historical denominations.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| PostgreSQL 16 | Relational database |
| Prisma ORM 7 | Database access and migrations |
| TypeScript | Type-safe application development |
| Next.js App Router | Frontend and backend |
| Docker Compose | Local database infrastructure |

## 3. Design Principles

- Relational database normalisation where it adds value.
- Referential integrity.
- Personal-first, multi-user-ready architecture.
- Reusable philatelic definitions where appropriate.
- Preservation of original catalogue terminology for colour and printed denominations.
- Separation of shared and personal information.
- Data-preserving database migrations.
- Extensibility without unnecessary schema changes.
- Database-level validation where appropriate.

## 4. Database Structure

The Sprint 07.5 implementation contains 23 models, six enums and nine database migrations.

### 4.1 Identity and Geography

| Model | Responsibility |
|---|---|
| User | Collector identity |
| Country | Stamp-issuing countries and optional metadata |

Country supports optional `flagUrl` and `description` text fields. `flagUrl` stores a URL or application-managed flag reference; `description` stores historical or philatelic information. Both are nullable to support historical territories, defunct issuing authorities and incomplete records. Flag rendering and country management are deferred. External image URLs must be validated before rendering.

### 4.2 International Catalogue

| Model | Responsibility |
|---|---|
| Stamp | Shared stamp information, including optional printed face value and colour |
| Catalogue | International catalogue systems |
| CatalogueReference | Catalogue-specific stamp numbers |
| Currency | Modern and historical currencies for financial valuations and acquisitions |

### 4.3 Reusable Philatelic Attributes

| Model | Responsibility |
|---|---|
| Watermark | Reusable watermark definitions |
| WatermarkCountry | Watermark-to-country relationships |
| Perforation | Reusable perforation measurements |
| StampType | Stamp classifications |
| StampSeries | Stamp series and sets |
| Theme | Reusable thematic classifications |
| StampTheme | Stamp-to-theme relationships |

### 4.4 Dynamic Variations

| Model | Responsibility |
|---|---|
| StampVariant | Identifiable variations of a stamp, including optional colour override |
| VariationType | Expandable variation categories |
| VariationValue | Reusable variation values |
| VariantAttribute | Variation-to-value relationships |

### 4.5 Historical Catalogue Valuations

| Model | Responsibility |
|---|---|
| CatalogueEdition | Published catalogue editions |
| CatalogueValuation | Historical published stamp values |

### 4.6 Personal Collections and Images

| Model | Responsibility |
|---|---|
| Album | Personal stamp albums |
| CollectionItem | Individual physical stamp ownership |
| CollectionImage | Personal stamp image metadata |
| CatalogueImage | Shared reference image metadata |

### 4.7 Sprint 07.5 Refinements

The `Colour`, `StampColour` and `VariantColour` models were removed after migrating linked colour names to text. The old `Stamp.denomination` and `Stamp.currencyId` columns were removed and the numeric face value replaced by nullable text. Financial currency relationships are unchanged.

## 5. Database Enums

| Enum | Responsibility |
|---|---|
| WatermarkStatus | Watermark availability |
| WatermarkOrientation | Watermark orientation |
| PerforationType | Perforation classification |
| StampStatus | Postal and gum condition |
| PhysicalGrade | Physical condition grading |
| StampImageType | Image classification |

Expandable philatelic definitions are stored in database tables when structured reuse is appropriate. Controlled application states are represented by enums.

## 6. Shared Stamp Catalogue

The shared catalogue describes stamps independently of whether a collector owns them.

A stamp includes:

- Issuing country.
- Mandatory issue year.
- Optional issue month and day.
- Optional name and description.
- Optional printed face value stored as free text.
- Optional catalogue colour stored as free text.
- Actual width and height in millimetres, when known.
- Catalogue references.
- Reusable philatelic attributes.
- Optional variations.
- Shared reference images.

Unknown information must not be replaced with invented values.

### Printed Face Value

`Stamp.faceValue` is a nullable text field. Examples include `1d`, `½d`, `2s 6d`, `50c + 10c`, `1st Class` and `10 Lei`.

The field preserves the printed denomination or catalogue representation without imposing a modern numeric currency model. It must not be treated as a purchase price, market value or catalogue valuation. Unknown values remain NULL. During migration, an available nonblank original denomination takes precedence; numeric amounts and currency codes are retained as a textual fallback when the denomination is missing. A currency-only record retains its code.

Currency remains a separate financial reference model. The removal of a stamp's currency relationship does not remove the currency model or the three financial foreign keys.

## 7. International Catalogue References

Supported catalogue systems include Stanley Gibbons (SG), Scott (SC), Michel (MI) and Yvert & Tellier (YT).

Catalogue numbers are stored as strings to preserve prefixes, suffixes and other catalogue-specific numbering conventions. A display reference can be constructed from the catalogue code, country code and complete catalogue number, for example `SG-GB-48A`.

Catalogue numbers 48 and 48A are independent catalogue references. A suffix does not automatically represent a stamp variation. Explicit equivalents from different catalogues can reference the same shared stamp.

## 8. Reusable Philatelic Attributes

### Colours

Catalogue colours are optional free-text values. `Stamp.colour` contains the primary catalogue colour; `StampVariant.colour` may contain an explicit override.

Examples include Black, Rose Red, Deep Carmine, Blue-Green and Multicoloured. When a variation does not specify a nonblank colour, the application inherits the parent colour. `getEffectiveStampColour` trims surrounding whitespace and returns NULL when neither value contains information. Inherited values are calculated rather than stored twice.

During Sprint 07.5, existing linked colour names were transferred into text fields. Multiple linked colours were combined into alphabetically ordered, comma-separated values. Unused definitions, hexadecimal approximations and colour descriptions are no longer retained in the active schema; the pre-migration backup preserves them.

Future colour suggestions, autocomplete and search need not enforce a fixed colour library.

### Watermarks

Watermark definitions are reusable and may be associated with multiple issuing countries. Watermark status distinguishes between no watermark, watermark present and unknown watermark status. Watermark orientation is stored separately from its definition.

### Perforations

Perforations are represented using reusable definitions with optional horizontal and vertical measurements. Perforation classification distinguishes between perforated, imperforate, partially perforated and unknown. Physical stamp dimensions are independent of perforation measurements.

### Classifications

Stamp types, series and themes provide reusable catalogue classification information. A stamp may belong to multiple themes.

## 9. Dynamic Stamp Variations

Variations are optional. A stamp does not need to have a default variation.

Each variation belongs to a shared catalogue stamp and can represent plate number, printing method, colour differences, watermark differences, perforation differences and printing errors.

VariationType, VariationValue and VariantAttribute support expandable variation characteristics without requiring a new database column for every characteristic.

Dedicated relationships are available for watermarks and perforations. Colour overrides are stored directly on StampVariant. A variation may override selected characteristics of its parent stamp. Physical damage to an owned stamp is not a catalogue variation.

## 10. Historical Catalogue Valuations

Catalogue valuations are stored independently of personal purchase prices and estimated market values.

Each valuation references:

- A catalogue reference.
- A catalogue publication edition.
- A stamp status.
- A monetary amount.
- A currency.
- An optional stamp variation.

Historical valuations are retained rather than overwritten when a new catalogue edition becomes available. Separate partial unique indexes prevent duplicate general and variation-specific valuations within the same edition and stamp status.

## 11. Personal Collections

Each CollectionItem represents exactly one physical stamp belonging to one collector. Collection items reference a shared Stamp and may optionally reference a specific StampVariant.

Individual ownership records allow identical stamps to retain different conditions, prices, photographs and personal notes. There is no stored quantity field. Collection quantities are calculated by counting ownership records.

## 12. Personal Albums

Albums belong to individual collectors. Album names are unique per collector. An album may contain stamps from different countries, series or themes.

Each physical stamp can belong to one album or remain unallocated. A NULL albumId represents an unallocated stamp. Compound foreign keys prevent assigning a collection item to another collector's album.

Deleting an album must not delete the collector's stamps. The application must unallocate its stamps before deleting it.

## 13. Stamp Condition

Stamp status and physical grade are stored independently.

Supported stamp statuses:

- MNH — Mint Never Hinged.
- MH — Mint Hinged.
- USED — Used.
- CTO — Cancelled to Order.

Supported physical grades: Extra Fine, Fine, Fair and Poor. Physical grade is optional. Detailed physical imperfections can be recorded in condition notes.

## 14. Financial Information

Each collection item may store purchase price, purchase currency, purchase date, estimated market value, market value currency and market valuation date.

A NULL purchase price represents unknown acquisition cost. A zero purchase price represents a free acquisition. Monetary amounts use Decimal database fields to avoid floating-point rounding errors. Purchase and market valuation currencies are independent.

Collection totals involving different currencies must not be combined without an appropriate currency conversion policy. A future user display-currency preference and exchange-rate conversion are planned; original amounts and currencies must remain available. No currency conversion implementation or user currency preference was introduced in Sprint 07.5.

## 15. Image Management

Shared catalogue images and personal stamp photographs are stored separately. CatalogueImage contains shared stamp reference image metadata. CollectionImage contains photographs of individual physical stamps.

Images may be classified as Front, Back, Detail, Watermark or Other. The database stores metadata and provider-independent storage keys. Actual image files will be managed by a future storage service.

The initial implementation permits one front and one back image per personal collection item, with additional detail images. Catalogue images support optional source attribution and licensing information.

## 16. Database Integrity

Database integrity is enforced using primary keys, foreign keys, compound foreign keys, unique constraints, compound unique constraints, CHECK constraints and partial unique indexes. Custom SQL migrations enforce additional PostgreSQL constraints.

Important protections include:

- Valid issue date components.
- Positive physical dimensions.
- Non-negative financial monetary amounts.
- Required currencies for recorded collection values.
- Watermark consistency.
- Valid perforation measurements.
- Matching stamps and variations.
- Cross-user album assignment prevention.
- Historical valuation uniqueness.
- Valid image metadata.

The former numeric stamp face-value CHECK constraint is no longer applicable; financial constraints remain.

Migrations applied to shared or production databases must remain unchanged. A local-only migration may be corrected before publication only after confirming deployment scope and safely reconstructing every affected environment. Never manually change Prisma migration checksums to hide an inconsistency.

Destructive changes require SQL review before application, verified recoverable backups, explicit data transformation before dropping populated fields, fresh installation testing, populated upgrade testing and appropriate automated regression assertions.

## 17. Deletion Policies

| Operation | Behaviour |
|---|---|
| Delete an empty album | Allowed |
| Delete an album containing stamps | Restricted until unallocated |
| Delete a collection item | Personal image metadata cascades |
| Delete a referenced catalogue stamp | Restricted |
| Delete a referenced variation | Restricted |
| Delete a user with owned records | Restricted |
| Delete a referenced currency | Restricted |

Deleting image metadata does not automatically delete the corresponding image file. Physical file cleanup will be handled by the storage service.

## 18. Multi-user Security

Database relationships enforce ownership consistency. They do not independently provide authentication or complete multi-user data isolation.

Future application services must implement user authentication, server-side authorisation, user-scoped database queries based on verified identity, shared catalogue editing permissions, protected personal image access and secure upload validation. These requirements must be completed before production deployment. User-scoped DAL queries already exist, but do not replace request-level security.

## 19. Future Album Page Designer

Printable album layouts will reference shared catalogue entries independently of physical stamp ownership.

Planned functionality includes configurable page sizes, automatic placeholder generation, catalogue-range selection, individual placeholder dimensions, adjustable stamp padding, manual placeholder positioning, adding and removing placeholders and printable output.

The physical collection and printable page layouts will remain separate architectural concerns.

## 20. Related Documentation

- [Database ERD](./database-erd.md)
- [Technical Debt](./technical-debt.md)
- [Development Setup](./development-setup.md)
- [Sprint 07.5 Migration Review](./sprint-07-5-migration-review.md)
- [Prisma Schema](../prisma/schema.prisma)
- [Database Migrations](../prisma/migrations/)

The Prisma schema and reviewed SQL migrations are the authoritative database definitions.

## 21. Implementation Status

| Metric | Sprint 07.5 implementation |
|---|---|
| Database models | 23 |
| Database enums | 6 |
| Database migrations | 9 |
| Shared catalogue foundation | Implemented |
| Country metadata | Implemented |
| Free-text catalogue colours | Implemented |
| Free-text printed face values | Implemented |
| Dynamic variations | Implemented |
| Historical valuations | Implemented |
| Personal collection foundation | Implemented |
| Image metadata | Implemented |
| Migration regression suite | Implemented; all eight assertion groups passed locally |
| Authentication | Planned |
| Image storage | Planned |
| Album page designer | Planned |

The Week 24 MVP and Week 36 production release milestones remain unchanged.

## 22. Application Data Contract

The server-only DAL maps Prisma records into the application-facing `Stamp` interface. The existing `country` string, catalogue references, description and filtering semantics remain compatible. Optional `faceValue`, `colour`, `countryFlagUrl` and `countryDescription` properties are exposed by the catalogue API; database-backed records return null for missing values. The stamp list displays face value and colour with a missing-value fallback and shows available catalogue references. Variant colour resolution lives in `src/lib/stamp-colour.ts` for reuse by future detail and collection interfaces. Dedicated colour and face-value filtering, country management and flag rendering remain future work.
