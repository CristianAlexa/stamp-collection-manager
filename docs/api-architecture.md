
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
| PATCH | /api/stamps/:id | Planned |
| DELETE | /api/stamps/:id | Planned |


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


## 9. Review History

| Sprint | Changes |
|---|---|
| Week 08, Day 1 | Established API response standards |
| Week 08, Day 2 | Implemented catalogue detail API and DTO |
| Week 08, Day 3 | Catalogue creation, transaction handling and mutation guard |
