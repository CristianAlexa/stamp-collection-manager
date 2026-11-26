
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
| POST | /api/stamps | Planned |
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

## 8. Testing

API response utilities are covered by automated unit tests.

Catalogue endpoints will receive additional integration
tests during Sprint 08.

## 9. Review History

| Sprint | Changes |
|---|---|
| Week 08, Day 1 | Established API response standards |
| Week 08, Day 2 | Implemented catalogue detail API and DTO |
