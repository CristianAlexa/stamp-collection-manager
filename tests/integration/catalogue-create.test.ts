
import assert from "node:assert/strict";
import {
  after,
  afterEach,
  before,
  test,
} from "node:test";
import { randomUUID } from "node:crypto";

import { prisma } from "../../src/lib/prisma";
import { POST } from "../../src/app/api/stamps/route";
import {
  catalogueMutationsAllowed,
} from "../../src/lib/api/mutation-guard";

import type {
  ApiSuccessResponse,
  ApiErrorResponse,
} from "../../src/types/api";

import type {
  StampDetail,
} from "../../src/types/stamp-detail";

// Refuse to run against any non-test database.
const databaseUrl = new URL(
  process.env.DATABASE_URL ?? "",
);

assert.equal(process.env.NODE_ENV, "test");
assert.equal(databaseUrl.protocol, "postgresql:");
assert.equal(databaseUrl.hostname, "127.0.0.1");
assert.equal(databaseUrl.port, "5434");
assert.equal(
  databaseUrl.pathname,
  "/stamp_collection_test",
);

assert.equal(
  process.env.ALLOW_DEV_MUTATIONS,
  "true",
);

// Unique marker for records created by this test run.
const marker = `CRUD-TEST-${randomUUID()}`;

let countryId: string;

before(async () => {
  console.log("CRUD fixture marker:", marker);

  const country = await prisma.country.findUniqueOrThrow({
    where: {
      name: "Great Britain",
    },
  });

  countryId = country.id;
});

/**
 * Builds a valid test payload.
 */
function fixture(
  overrides: Record<string, unknown> = {},
) {
  return {
    name: "Temporary test stamp",
    description: marker,
    countryId,
    year: 2020,
    ...overrides,
  };
}

/**
 * Calls the actual POST route handler.
 */
function post(payload: unknown) {
  return POST(
    new Request("http://localhost/api/stamps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  );
}

/**
 * Verifies a standardised API error.
 */
async function assertError(
  response: Response,
  status: number,
  code: string,
) {
  assert.equal(response.status, status);

  const body: ApiErrorResponse =
    await response.json();

  assert.equal(body.error.code, code);
  assert.ok(body.error.message);
}

/**
 * Removes only records belonging to this test run.
 */
afterEach(async () => {
  const stamps = await prisma.stamp.findMany({
    where: {
      description: marker,
    },
    select: {
      id: true,
    },
  });

  const ids = stamps.map((stamp) => stamp.id);

  if (ids.length === 0) {
    return;
  }

  await prisma.$transaction([
    prisma.catalogueReference.deleteMany({
      where: {
        stampId: {
          in: ids,
        },
      },
    }),

    prisma.stamp.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    }),
  ]);
});

after(async () => {
  await prisma.$disconnect();
});

test("creates a stamp with multiple catalogue references", async () => {
  const number = `${marker}-MULTI`;

  const response = await post(
    fixture({
      faceValue: "1st",
      colour: "Multicoloured",
      catalogueReferences: [
        {
          catalogueCode: "sg",
          catalogueNumber: number,
        },
        {
          catalogueCode: "SC",
          catalogueNumber: number,
        },
      ],
    }),
  );

  assert.equal(response.status, 201);

  const body: ApiSuccessResponse<StampDetail> =
    await response.json();

  const stamp = body.data;

  assert.ok(stamp.id);
  assert.equal(stamp.year, 2020);
  assert.equal(stamp.country.id, countryId);
  assert.equal(stamp.faceValue, "1st");
  assert.equal(stamp.colour, "Multicoloured");

  assert.equal(
    response.headers.get("location"),
    `/api/stamps/${stamp.id}`,
  );

  assert.deepEqual(
    stamp.catalogueReferences.map(
      (reference) => reference.catalogueCode,
    ),
    ["SC", "SG"],
  );

  assert.equal(
    stamp.catalogueReferences.length,
    2,
  );

  const storedReferences =
    await prisma.catalogueReference.count({
      where: {
        stampId: stamp.id,
      },
    });

  assert.equal(storedReferences, 2);
});

test("creates a stamp with optional characteristics missing", async () => {
  const response = await post({
    description: marker,
    countryId,
    year: 2020,
  });

  assert.equal(response.status, 201);

  const body: ApiSuccessResponse<StampDetail> =
    await response.json();

  assert.equal(
    body.data.name,
    "Unidentified stamp",
  );

  assert.equal(body.data.faceValue, null);
  assert.equal(body.data.colour, null);
  assert.equal(body.data.watermarkStatus, "UNKNOWN");
  assert.deepEqual(
    body.data.catalogueReferences,
    [],
  );
});

test("rejects invalid stamp data", async () => {
  const response = await post(
    fixture({
      year: "abc",
    }),
  );

  await assertError(
    response,
    400,
    "INVALID_STAMP_DATA",
  );

  // Unexpected client-managed fields are rejected.
  const unexpectedField = await post(
    fixture({
      id: "client-generated-id",
    }),
  );

  await assertError(
    unexpectedField,
    400,
    "INVALID_STAMP_DATA",
  );
});

test("rejects multiple references to the same catalogue", async () => {
  const response = await post(
    fixture({
      catalogueReferences: [
        {
          catalogueCode: "SG",
          catalogueNumber: "TEST-001",
        },
        {
          catalogueCode: "sg",
          catalogueNumber: "TEST-002",
        },
      ],
    }),
  );

  await assertError(
    response,
    400,
    "INVALID_STAMP_DATA",
  );
});

test("rejects an unknown issuing country", async () => {
  const response = await post(
    fixture({
      countryId: "nonexistent-country",
    }),
  );

  await assertError(
    response,
    400,
    "COUNTRY_NOT_FOUND",
  );
});

test("rejects an unknown catalogue definition", async () => {
  const response = await post(
    fixture({
      catalogueReferences: [
        {
          catalogueCode: "NONEXISTENT",
          catalogueNumber: "TEST-001",
        },
      ],
    }),
  );

  await assertError(
    response,
    400,
    "CATALOGUE_NOT_FOUND",
  );
});

test("rolls back creation when a catalogue reference conflicts", async () => {
  const freshNumber = `${marker}-ROLLBACK`;

  const response = await post(
    fixture({
      catalogueReferences: [
        {
          catalogueCode: "SC",
          catalogueNumber: freshNumber,
        },
        {
          catalogueCode: "SG",
          catalogueNumber: "43",
        },
      ],
    }),
  );

  await assertError(
    response,
    409,
    "DUPLICATE_CATALOGUE_REFERENCE",
  );

  // The stamp must not survive the failed transaction.
  const stampCount = await prisma.stamp.count({
    where: {
      description: marker,
    },
  });

  assert.equal(stampCount, 0);

  // The non-conflicting reference must not survive either.
  const referenceCount =
    await prisma.catalogueReference.count({
      where: {
        countryId,
        catalogueNumber: freshNumber,
        catalogue: {
          code: "SC",
        },
      },
    });

  assert.equal(referenceCount, 0);
});

test("rejects malformed JSON and incorrect content types", async () => {
  const malformed = await POST(
    new Request("http://localhost/api/stamps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{invalid json",
    }),
  );

  await assertError(
    malformed,
    400,
    "INVALID_JSON",
  );

  const incorrectType = await POST(
    new Request("http://localhost/api/stamps", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(fixture()),
    }),
  );

  await assertError(
    incorrectType,
    400,
    "INVALID_CONTENT_TYPE",
  );
});

test("rejects catalogue mutations without explicit permission", async () => {
  const original =
    process.env.ALLOW_DEV_MUTATIONS;

  try {
    delete process.env.ALLOW_DEV_MUTATIONS;

    const response = await post(fixture());

    await assertError(
      response,
      403,
      "MUTATIONS_DISABLED",
    );
  } finally {
    if (original === undefined) {
      delete process.env.ALLOW_DEV_MUTATIONS;
    } else {
      process.env.ALLOW_DEV_MUTATIONS = original;
    }
  }
});

test("mutation guard rejects production and unapproved databases", () => {
  assert.equal(
    catalogueMutationsAllowed(),
    true,
  );

  assert.equal(
    catalogueMutationsAllowed({
      ...process.env,
      NODE_ENV: "production",
    }),
    false,
  );

  assert.equal(
    catalogueMutationsAllowed({
      ...process.env,
      DATABASE_URL:
        "postgresql://example.com:5434/stamp_collection_test",
    }),
    false,
  );

  assert.equal(
    catalogueMutationsAllowed({
      ...process.env,
      DATABASE_URL:
        "postgresql://127.0.0.1:5433/stamp_collection",
    }),
    false,
  );

  assert.equal(
    catalogueMutationsAllowed({
      ...process.env,
      DATABASE_URL: "invalid-url",
    }),
    false,
  );

  assert.equal(
    catalogueMutationsAllowed({
      ...process.env,
      DATABASE_URL: undefined,
    }),
    false,
  );
});
