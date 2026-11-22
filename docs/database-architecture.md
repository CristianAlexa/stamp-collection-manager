
# Stamp Collection Manager — Database Architecture v3.0

## 1. Overview

Stamp Collection Manager is a personal-first, multi-user-ready
philatelic collection management application.

The database separates three distinct areas:

- Shared stamp catalogue information.
- Individual physical stamp ownership.
- Future printable album layouts.

This separation allows collectors to manage their personal collections
without duplicating shared catalogue information.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| PostgreSQL 16 | Relational database |
| Prisma ORM 7 | Database access and migrations |
| TypeScript | Type-safe application development |
| Next.js App Router | Frontend and backend |
| Docker Compose | Local database infrastructure |

## 3. Design Principles

- Relational database normalisation.
- Referential integrity.
- Personal-first, multi-user-ready architecture.
- Reusable philatelic definitions.
- Separation of shared and personal information.
- Data-preserving database migrations.
- Extensibility without unnecessary schema changes.
- Database-level validation where appropriate.

## 4. Database Structure

The Week 6 implementation contains 26 models, six enums
and six database migrations.

### 4.1 Identity and Geography

| Model | Responsibility |
|---|---|
| User | Collector identity |
| Country | Stamp-issuing countries |

### 4.2 International Catalogue

| Model | Responsibility |
|---|---|
| Stamp | Shared stamp information |
| Catalogue | International catalogue systems |
| CatalogueReference | Catalogue-specific stamp numbers |
| Currency | Modern and historical currencies |

### 4.3 Reusable Philatelic Attributes

| Model | Responsibility |
|---|---|
| Colour | Reusable colour definitions |
| StampColour | Stamp-to-colour relationships |
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
| StampVariant | Identifiable variations of a stamp |
| VariationType | Expandable variation categories |
| VariationValue | Reusable variation values |
| VariantAttribute | Variation-to-value relationships |
| VariantColour | Variation-to-colour relationships |

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

## 5. Database Enums

| Enum | Responsibility |
|---|---|
| WatermarkStatus | Watermark availability |
| WatermarkOrientation | Watermark orientation |
| PerforationType | Perforation classification |
| StampStatus | Postal and gum condition |
| PhysicalGrade | Physical condition grading |
| StampImageType | Image classification |

Expandable philatelic definitions are stored in database tables.
Controlled application states are represented by enums.

## 6. Shared Stamp Catalogue

The shared catalogue describes stamps independently of whether
a collector owns them.

A stamp includes:

- Issuing country.
- Mandatory issue year.
- Optional issue month and day.
- Optional name and description.
- Printed denomination.
- Optional decimal face value and currency.
- Actual width and height in millimetres.
- Catalogue references.
- Reusable philatelic attributes.
- Optional variations.
- Shared reference images.

Unknown information must not be replaced with invented values.

## 7. International Catalogue References

Supported catalogue systems include:

- Stanley Gibbons (SG).
- Scott (SC).
- Michel (MI).
- Yvert & Tellier (YT).

Catalogue numbers are stored as strings to preserve prefixes,
suffixes and other catalogue-specific numbering conventions.

A display reference can be constructed from the catalogue code,
country code and complete catalogue number.

Example:

`SG-GB-48A`

Catalogue numbers 48 and 48A are independent catalogue references.
A suffix does not automatically represent a stamp variation.

Explicit equivalents from different catalogues can reference
the same shared stamp.

## 8. Reusable Philatelic Attributes

### Colours

Colour definitions can be reused across stamps, variations
and issuing countries.

A colour has a name and may include a description and approximate
hexadecimal colour value.

A stamp may have multiple colours.

### Watermarks

Watermark definitions are reusable and may be associated with
multiple issuing countries.

Watermark status distinguishes between:

- No watermark.
- Watermark present.
- Unknown watermark status.

Watermark orientation is stored separately from its definition.

### Perforations

Perforations are represented using reusable definitions
with optional horizontal and vertical measurements.

Perforation classification distinguishes between:

- Perforated.
- Imperforate.
- Partially perforated.
- Unknown.

Physical stamp dimensions are independent of perforation measurements.

### Classifications

Stamp types, series and themes provide reusable catalogue
classification information.

A stamp may belong to multiple themes.

## 9. Dynamic Stamp Variations

Variations are optional.

A stamp does not need to have a default variation.

Each variation belongs to a shared catalogue stamp and can
represent characteristics such as:

- Plate number.
- Printing method.
- Colour differences.
- Watermark differences.
- Perforation differences.
- Printing errors.

VariationType, VariationValue and VariantAttribute support
expandable variation characteristics without requiring a new
database column for every characteristic.

Dedicated relationships are available for colours,
watermarks and perforations.

A variation may override selected characteristics of its parent stamp.

Physical damage to an owned stamp is not a catalogue variation.

## 10. Historical Catalogue Valuations

Catalogue valuations are stored independently of personal
purchase prices and estimated market values.

Each valuation references:

- A catalogue reference.
- A catalogue publication edition.
- A stamp status.
- A monetary amount.
- A currency.
- An optional stamp variation.

Historical valuations are retained rather than overwritten
when a new catalogue edition becomes available.

Separate partial unique indexes prevent duplicate general
and variation-specific valuations within the same edition
and stamp status.

## 11. Personal Collections

Each CollectionItem represents exactly one physical stamp
belonging to one collector.

Collection items reference a shared Stamp and may optionally
reference a specific StampVariant.

Individual ownership records allow identical stamps to retain
different conditions, prices, photographs and personal notes.

There is no stored quantity field.

Collection quantities are calculated by counting ownership records.

## 12. Personal Albums

Albums belong to individual collectors.

Album names are unique per collector.

An album may contain stamps from different countries,
series or themes.

Each physical stamp can belong to one album or remain unallocated.

A NULL albumId represents an unallocated stamp.

Compound foreign keys prevent assigning a collection item
to another collector's album.

Deleting an album must not delete the collector's stamps.
The application must unallocate its stamps before deleting it.

## 13. Stamp Condition

Stamp status and physical grade are stored independently.

Supported stamp statuses:

- MNH — Mint Never Hinged.
- MH — Mint Hinged.
- USED — Used.
- CTO — Cancelled to Order.

Supported physical grades:

- Extra Fine.
- Fine.
- Fair.
- Poor.

Physical grade is optional.

Detailed physical imperfections can be recorded in condition notes.

## 14. Financial Information

Each collection item may store:

- Purchase price.
- Purchase currency.
- Purchase date.
- Estimated market value.
- Market value currency.
- Market valuation date.

A NULL purchase price represents unknown acquisition cost.

A zero purchase price represents a free acquisition.

Monetary amounts use Decimal database fields to avoid
floating-point rounding errors.

Purchase and market valuation currencies are independent.

Collection totals involving different currencies must not be
combined without an appropriate currency conversion policy.

## 15. Image Management

Shared catalogue images and personal stamp photographs
are stored separately.

CatalogueImage contains shared stamp reference image metadata.

CollectionImage contains photographs of individual physical stamps.

Images may be classified as:

- Front.
- Back.
- Detail.
- Watermark.
- Other.

The database stores metadata and provider-independent storage keys.

Actual image files will be managed by a future storage service.

The initial implementation permits one front and one back image
per personal collection item, with additional detail images.

Catalogue images support optional source attribution and licensing information.

## 16. Database Integrity

Database integrity is enforced using:

- Primary keys.
- Foreign keys.
- Compound foreign keys.
- Unique constraints.
- Compound unique constraints.
- CHECK constraints.
- Partial unique indexes.

Custom SQL migrations enforce additional PostgreSQL constraints.

Important protections include:

- Valid issue date components.
- Positive physical dimensions.
- Non-negative monetary amounts.
- Required currencies for recorded collection values.
- Watermark consistency.
- Valid perforation measurements.
- Matching stamps and variations.
- Cross-user album assignment prevention.
- Historical valuation uniqueness.
- Valid image metadata.

Existing migrations must remain unchanged after application.

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

Deleting image metadata does not automatically delete
the corresponding image file.

Physical file cleanup will be handled by the storage service.

## 18. Multi-user Security

Database relationships enforce ownership consistency.

They do not independently provide authentication or
complete multi-user data isolation.

Future application services must implement:

- User authentication.
- Server-side authorisation.
- User-scoped database queries.
- Shared catalogue editing permissions.
- Protected personal image access.
- Secure upload validation.

These requirements must be completed before production deployment.

## 19. Future Album Page Designer

Printable album layouts will reference shared catalogue entries
independently of physical stamp ownership.

Planned functionality includes:

- Configurable page sizes.
- Automatic placeholder generation.
- Catalogue-range selection.
- Individual placeholder dimensions.
- Adjustable stamp padding.
- Manual placeholder positioning.
- Adding and removing placeholders.
- Printable output.

The physical collection and printable page layouts
will remain separate architectural concerns.

## 20. Related Documentation

- [Database ERD](./database-erd.md)
- [Technical Debt](./technical-debt.md)
- [Development Setup](./development-setup.md)
- [Prisma Schema](../prisma/schema.prisma)
- [Database Migrations](../prisma/migrations/)

The Prisma schema and applied SQL migrations are the
authoritative database definitions.

## 21. Implementation Status

| Metric | Week 6 implementation |
|---|---|
| Database models | 26 |
| Database enums | 6 |
| Database migrations | 6 |
| Shared catalogue foundation | Implemented |
| Dynamic variations | Implemented |
| Historical valuations | Implemented |
| Personal collection foundation | Implemented |
| Image metadata | Implemented |
| Authentication | Planned |
| Image storage | Planned |
| Album page designer | Planned |

The Week 6 implementation provides the relational database
foundation for subsequent application development.

The Week 24 MVP and Week 36 production release milestones
remain unchanged.
