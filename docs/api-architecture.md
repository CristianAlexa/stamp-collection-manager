
# Stamp Collection Manager — API Architecture

## 1. Overview

The application uses REST-style API endpoints implemented
with Next.js App Router route handlers.

The API separates HTTP request handling, validation,
data access and database operations.

## 2. Architecture

Application UI
→ API Route Handler
→ Zod Validation
→ Data Access Layer
→ Prisma ORM
→ PostgreSQL

## 3. API Response Standards

Reusable response utilities are located in:

`src/lib/api/responses.ts`

| Utility | Purpose |
|---|---|
| apiSuccess | Returns one resource |
| apiList | Returns resources and count |
| apiError | Returns a standardised error |
| apiNoContent | Returns an empty 204 response |

Shared response types are defined in:

`src/types/api.ts`

## 4. HTTP Status Codes

- 200: Successful request
- 201: Resource created
- 204: Successful request without a body
- 400: Invalid request
- 401: Authentication required
- 403: Insufficient permissions
- 404: Resource not found
- 409: Resource conflict
- 500: Internal server error

## 5. Catalogue Endpoints


| Method | Endpoint | Status |
|---|---|---|
| GET | /api/stamps | Implemented |
| GET | /api/stamps/:id | Implemented |
| POST | /api/stamps | Implemented — development only |
| PATCH | /api/stamps/:id | Implemented — development only |
| DELETE | /api/stamps/:id | Implemented — development only |



### 5.1 Catalogue Stamp Detail

GET /api/stamps/:id

Returns detailed information about one shared
catalogue stamp.

The StampDetail DTO is defined in:

`src/types/stamp-detail.ts`

The application-facing data access function is:

`getCatalogueStampDetail()`

It reuses the existing getCatalogueStampById()
relational database query.

The response includes:

- Stamp identification and issue date
- Issuing country information
- Printed face value and catalogue colour
- Physical dimensions
- Stamp classification
- Watermark and perforation information
- Structured catalogue references
- Variations and variation attributes
- Effective inherited variation colours

Decimal measurements are represented as strings.
Missing optional characteristics are represented as null.

Personal collection data, private images, purchase
prices and internal timestamps are excluded.

| HTTP Status | Error code |
|---|---|
| 200 | Successful response |
| 400 | INVALID_STAMP_ID |
| 404 | STAMP_NOT_FOUND |
| 500 | DATABASE_ERROR |

The endpoint is covered by database integration tests
for successful retrieval, variation colour inheritance,
missing records, invalid identifiers and nullable fields.

### 5.2 Catalogue Stamp Creation

POST /api/stamps

Creates a shared catalogue stamp and its optional
international catalogue references.

Request validation is defined in:

`src/lib/stamp-mutation-schema.ts`

The application-facing data access function is:

`createCatalogueStamp()`

Country and catalogue definitions must already exist.

Catalogue numbers are represented as strings and
preserve their case. Catalogue codes are normalised
to uppercase.

Stamp creation and catalogue reference creation
execute within a single Prisma transaction.

Any failed operation rolls back the entire creation.

Successful requests return HTTP 201, the complete
StampDetail DTO and a Location response header.

| HTTP Status | Error code |
|---|---|
| 201 | Resource created |
| 400 | INVALID_CONTENT_TYPE |
| 400 | INVALID_JSON |
| 400 | INVALID_STAMP_DATA |
| 400 | COUNTRY_NOT_FOUND |
| 400 | CATALOGUE_NOT_FOUND |
| 403 | MUTATIONS_DISABLED |
| 409 | DUPLICATE_CATALOGUE_REFERENCE |
| 409 | RELATION_CONFLICT |
| 500 | DATABASE_ERROR |

The initial creation interface supports core catalogue
fields and multiple catalogue references.

Additional catalogue characteristics will be introduced
incrementally.

Unknown optional values remain null. Newly created
stamps use UNKNOWN for unconfirmed watermark status.


### 5.3 Catalogue Stamp Updates

PATCH /api/stamps/:id

Partially updates an existing shared catalogue stamp.

Request validation is provided by updateStampSchema
in src/lib/stamp-mutation-schema.ts.

The application-facing data access function is
updateCatalogueStamp().

#### Partial update behaviour

- Omitted fields remain unchanged.
- Nullable fields can be cleared using null.
- Empty update requests are rejected.
- The internal stamp ID and country are immutable.
- Existing issue dates must remain valid.

#### Catalogue reference behaviour

Submitted catalogue references are added or updated.
Omitted references remain unchanged.

Existing reference IDs are preserved when correcting
catalogue numbers.

References associated with historical valuations
cannot be renumbered through this endpoint.

Reference removal and country reassignment require
dedicated future workflows.

#### Transaction handling

Updates execute within a Serializable Prisma transaction.

Conflicting updates roll back the entire transaction,
including scalar and catalogue reference changes.

Successful requests return HTTP 200 and the complete
StampDetail DTO.

| HTTP Status | Error code |
|---|---|
| 200 | Successful update |
| 400 | INVALID_STAMP_ID |
| 400 | INVALID_CONTENT_TYPE |
| 400 | INVALID_JSON |
| 400 | INVALID_STAMP_DATA |
| 400 | INVALID_ISSUE_DATE |
| 400 | CATALOGUE_NOT_FOUND |
| 403 | MUTATIONS_DISABLED |
| 404 | STAMP_NOT_FOUND |
| 409 | DUPLICATE_CATALOGUE_REFERENCE |
| 409 | CATALOGUE_REFERENCE_IN_USE |
| 409 | RELATION_CONFLICT |
| 409 | WRITE_CONFLICT |
| 500 | DATABASE_ERROR |

The development mutation guard remains mandatory.

Authentication and authorisation are required before
production catalogue editing can be enabled.


### 5.4 Catalogue Stamp Deletion

DELETE /api/stamps/:id

Safely deletes an existing shared catalogue stamp.

The application-facing data access function is:

`deleteCatalogueStamp()`

#### Protected dependencies

Deletion is prohibited when the stamp has:

- Personal collection items.
- Stamp variations.
- Catalogue images.
- Historical catalogue valuations.

The endpoint does not support forced deletion.

#### Removable associations

When no protected dependencies exist, deletion removes:

- Stamp-to-theme associations.
- Unused catalogue references.
- The catalogue stamp itself.

Reusable country, catalogue, theme, currency,
watermark, perforation, series and stamp type
definitions remain unchanged.

#### Transaction handling

Dependency checks and deletion operations execute
within a Serializable Prisma transaction.

Restrictive PostgreSQL foreign keys provide
additional database-level integrity protection.

Any failed operation rolls back the transaction.

Successful deletion returns HTTP 204 with an
empty response body.

| HTTP Status | Error code |
|---|---|
| 204 | Successful deletion |
| 400 | INVALID_STAMP_ID |
| 403 | MUTATIONS_DISABLED |
| 404 | STAMP_NOT_FOUND |
| 409 | STAMP_IN_COLLECTION |
| 409 | STAMP_HAS_VARIANTS |
| 409 | STAMP_HAS_IMAGES |
| 409 | STAMP_HAS_VALUATIONS |
| 409 | RELATION_CONFLICT |
| 409 | WRITE_CONFLICT |
| 500 | DATABASE_ERROR |

#### Security and limitations

The endpoint performs permanent deletion, not
archiving or soft deletion.

The development mutation guard remains mandatory.

Production catalogue deletion requires proper
authentication and authorisation.

Forced deletion is intentionally unsupported.


## 6. Validation and Error Handling

Incoming data must be validated before database mutations.

Detailed database errors must remain in server logs.
API responses must not expose database credentials,
internal queries or stack traces.

The existing INVALIDID_YEAR error code is retained
for compatibility. See technical debt item APP-001.

## 7. Security

Authentication and authorisation are outstanding.

Unauthenticated catalogue mutation endpoints must not
be exposed to a network or deployed to production.

Catalogue records are shared reference data.
Personal collections and albums require user-scoped access.


### Development Mutation Guard

Unauthenticated catalogue editing is temporarily
restricted by catalogueMutationsAllowed().

The guard requires:

- Development or test environment.
- ALLOW_DEV_MUTATIONS=true.
- An approved local PostgreSQL database.

Development servers must bind to the loopback address.

Production mutations remain disabled until proper
authentication and authorisation are implemented.

This guard is not a replacement for user authentication.


## 8. Testing

API response utilities are covered by automated unit tests.

Catalogue endpoints will receive additional integration
tests during Sprint 08.


Catalogue creation tests use unique temporary fixture
markers and clean up created catalogue references
and stamps after each test.

Integration test files execute sequentially to avoid
interference between CRUD tests and seeded read tests.

The development database is not used by automated
CRUD integration tests.

Catalogue update tests track temporary stamp and
catalogue edition IDs for targeted fixture cleanup.

Tests cover partial updates, nullable characteristics,
immutable fields, catalogue reference preservation,
historical valuation protection, transaction rollback,
issue date consistency and mutation restrictions.


### Catalogue Deletion Testing

Catalogue deletion tests use isolated temporary
stamp and catalogue edition identifiers.

The ten automated tests cover:

- Successful deletion with HTTP 204.
- Removal of unused catalogue references.
- Removal of stamp-to-theme associations.
- Preservation of reusable definitions.
- Invalid and unknown stamp identifiers.
- Personal collection and image protection.
- Stamp variation protection.
- Catalogue image protection.
- Historical valuation protection.
- Mutation permission restrictions.
- Database-level transaction rollback.

Fixture cleanup removes only records belonging
to the test suite, in dependency-safe order.

All 60 integration and seed safety tests passed
in two consecutive executions, confirming test
repeatability.


## 9. Review History

| Sprint | Changes |
|---|---|
| Week 08, Day 1 | Established API response standards |
| Week 08, Day 2 | Implemented catalogue detail API and DTO |
| Week 08, Day 3 | Catalogue creation, transaction handling and mutation guard |
| Week 08, Day 4 | Transactional catalogue updates and historical valuation protection |
| Week 08, Day 5 | Safe catalogue deletion and dependency protection |
