
import assert from "node:assert/strict";
import {
  after,
  afterEach,
  before,
  test,
} from "node:test";
import { randomUUID } from "node:crypto";

import { prisma } from "../../src/lib/prisma";
import { PATCH } from "../../src/app/api/stamps/[id]/route";

import type {
  ApiSuccessResponse,
  ApiErrorResponse,
} from "../../src/types/api";

import type {
  StampDetail,
} from "../../src/types/stamp-detail";

// Protect the development database.
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

const marker = `UPDATE-TEST-${randomUUID()}`;

const stampIds = new Set<string>();
const editionIds = new Set<string>();

let countryId: string;
let sgId: string;
let scId: string;

before(async () => {
  const [country, sg, sc] = await Promise.all([
    prisma.country.findUniqueOrThrow({
      where: {
        name: "Great Britain",
      },
    }),

    prisma.catalogue.findUniqueOrThrow({
      where: {
        code: "SG",
      },
    }),

    prisma.catalogue.findUniqueOrThrow({
      where: {
        code: "SC",
      },
    }),
  ]);

  countryId = country.id;
  sgId = sg.id;
  scId = sc.id;

  console.log("Update fixture marker:", marker);
});

/**
 * Creates an isolated test stamp and SG reference.
 */
async function fixture(
  issueDate: {
    issueMonth?: number;
    issueDay?: number;
  } = {},
) {
  const id = `${marker}-${randomUUID()}`;

  // Track the ID before attempting creation.
  stampIds.add(id);

  const stamp = await prisma.stamp.create({
    data: {
      id,
      name: "Temporary update stamp",
      description: marker,
      countryId,
      year: 2020,
      faceValue: "1st",
      colour: "Black",
      ...issueDate,
    },
  });

  const reference =
    await prisma.catalogueReference.create({
      data: {
        stampId: stamp.id,
        countryId,
        catalogueId: sgId,
        catalogueNumber: `${id}-SG`,
      },
    });

  return {
    stamp,
    reference,
  };
}

/**
 * Calls the actual PATCH route handler.
 */
function patch(id: string, payload: unknown) {
  return PATCH(
    new Request(
      `http://localhost/api/stamps/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    ),
    {
      params: Promise.resolve({ id }),
    },
  );
}

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
 * Removes only fixtures owned by this test suite.
 */
afterEach(async () => {
  const ids = [...stampIds];

  await prisma.$transaction([
    prisma.catalogueValuation.deleteMany({
      where: {
        stampId: {
          in: ids,
        },
      },
    }),

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

    prisma.catalogueEdition.deleteMany({
      where: {
        id: {
          in: [...editionIds],
        },
      },
    }),
  ]);

  stampIds.clear();
  editionIds.clear();
});

after(async () => {
  await prisma.$disconnect();
});


test("updates supplied fields and preserves omitted fields", async () => {
  const { stamp, reference } = await fixture();

  const response = await patch(stamp.id, {
    name: "Updated stamp",
    colour: "Blue",
  });

  assert.equal(response.status, 200);

  const body: ApiSuccessResponse<StampDetail> =
    await response.json();

  assert.equal(body.data.id, stamp.id);
  assert.equal(body.data.name, "Updated stamp");
  assert.equal(body.data.colour, "Blue");

  assert.equal(body.data.year, 2020);
  assert.equal(body.data.faceValue, "1st");
  assert.equal(body.data.country.id, countryId);

  assert.equal(
    body.data.catalogueReferences[0].catalogueNumber,
    reference.catalogueNumber,
  );

  const stored = await prisma.stamp.findUniqueOrThrow({
    where: {
      id: stamp.id,
    },
  });

  assert.equal(stored.name, "Updated stamp");
  assert.equal(stored.colour, "Blue");
});

test("clears optional characteristics using null", async () => {
  const { stamp } = await fixture();

  const response = await patch(stamp.id, {
    name: null,
    colour: null,
    faceValue: null,
    description: null,
  });

  assert.equal(response.status, 200);

  const body: ApiSuccessResponse<StampDetail> =
    await response.json();

  assert.equal(body.data.colour, null);
  assert.equal(body.data.faceValue, null);
  assert.equal(body.data.description, null);

  // The DTO uses the preferred reference when
  // the stored stamp name is missing.
  assert.equal(
    body.data.name,
    body.data.catalogueReferences[0].reference,
  );

  const stored = await prisma.stamp.findUniqueOrThrow({
    where: {
      id: stamp.id,
    },
  });

  assert.equal(stored.name, null);
});


test("rejects immutable fields and invalid updates", async () => {
  const { stamp } = await fixture();

  const invalidPayloads = [
    {},
    { id: "replacement-id" },
    { countryId: "another-country" },
    { year: "2020" },
    { year: null },
    { colour: "" },
    { catalogueReferences: [] },
    {
      catalogueReferences: [
        {
          catalogueCode: "SG",
          catalogueNumber: "A",
        },
        {
          catalogueCode: "sg",
          catalogueNumber: "B",
        },
      ],
    },
  ];

  for (const payload of invalidPayloads) {
    const response = await patch(
      stamp.id,
      payload,
    );

    await assertError(
      response,
      400,
      "INVALID_STAMP_DATA",
    );
  }
});

test("rejects invalid and unknown stamp identifiers", async () => {
  await assertError(
    await patch("stamp@004", {
      colour: "Blue",
    }),
    400,
    "INVALID_STAMP_ID",
  );

  await assertError(
    await patch(`missing-${randomUUID()}`, {
      colour: "Blue",
    }),
    404,
    "STAMP_NOT_FOUND",
  );
});


test("adds a catalogue reference and preserves existing references", async () => {
  const { stamp, reference } = await fixture();

  const response = await patch(stamp.id, {
    catalogueReferences: [
      {
        catalogueCode: "sc",
        catalogueNumber: `${stamp.id}-SC`,
      },
    ],
  });

  assert.equal(response.status, 200);

  const body: ApiSuccessResponse<StampDetail> =
    await response.json();

  assert.equal(
    body.data.catalogueReferences.length,
    2,
  );

  assert.deepEqual(
    body.data.catalogueReferences.map(
      (item) => item.catalogueCode,
    ),
    ["SC", "SG"],
  );

  const original =
    await prisma.catalogueReference.findUniqueOrThrow({
      where: {
        id: reference.id,
      },
    });

  assert.equal(
    original.catalogueNumber,
    reference.catalogueNumber,
  );

  assert.equal(
    original.stampId,
    stamp.id,
  );
});

test("corrects a catalogue number without replacing its reference ID", async () => {
  const { stamp, reference } = await fixture();

  const correctedNumber = `${stamp.id}-CORRECTED`;

  const response = await patch(stamp.id, {
    catalogueReferences: [
      {
        catalogueCode: "SG",
        catalogueNumber: correctedNumber,
      },
    ],
  });

  assert.equal(response.status, 200);

  const updated =
    await prisma.catalogueReference.findUniqueOrThrow({
      where: {
        id: reference.id,
      },
    });

  assert.equal(updated.id, reference.id);
  assert.equal(
    updated.catalogueNumber,
    correctedNumber,
  );

  assert.equal(
    await prisma.catalogueReference.count({
      where: {
        stampId: stamp.id,
      },
    }),
    1,
  );
});


test("rolls back scalar and reference changes when a duplicate conflicts", async () => {
  const { stamp, reference } = await fixture();

  const freshNumber = `${stamp.id}-ROLLBACK`;

  const response = await patch(stamp.id, {
    name: "This name must roll back",
    colour: "Blue",
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
  });

  await assertError(
    response,
    409,
    "DUPLICATE_CATALOGUE_REFERENCE",
  );

  const stored = await prisma.stamp.findUniqueOrThrow({
    where: {
      id: stamp.id,
    },
  });

  assert.equal(stored.name, stamp.name);
  assert.equal(stored.colour, stamp.colour);

  const original =
    await prisma.catalogueReference.findUniqueOrThrow({
      where: {
        id: reference.id,
      },
    });

  assert.equal(
    original.catalogueNumber,
    reference.catalogueNumber,
  );

  const addedReferences =
    await prisma.catalogueReference.count({
      where: {
        stampId: stamp.id,
        catalogueId: scId,
      },
    });

  assert.equal(addedReferences, 0);
});


test("protects catalogue references linked to historical valuations", async () => {
  const { stamp, reference } = await fixture();

  const currency =
    await prisma.currency.findUniqueOrThrow({
      where: {
        code: "GBP",
      },
    });

  const editionId = `edition-${randomUUID()}`;

  editionIds.add(editionId);

  const edition = await prisma.catalogueEdition.create({
    data: {
      id: editionId,
      catalogueId: sgId,
      publicationYear: 2020,
      editionName: marker,
    },
  });

  const valuation =
    await prisma.catalogueValuation.create({
      data: {
        catalogueId: sgId,
        catalogueReferenceId: reference.id,
        editionId: edition.id,
        stampId: stamp.id,
        status: "USED",
        amount: "12.50",
        currencyId: currency.id,
      },
    });

  // Resubmitting an unchanged number is allowed.
  const unchanged = await patch(stamp.id, {
    catalogueReferences: [
      {
        catalogueCode: "SG",
        catalogueNumber: reference.catalogueNumber,
      },
    ],
  });

  assert.equal(unchanged.status, 200);

  // Renumbering is blocked.
  const response = await patch(stamp.id, {
    name: "This name must not be saved",
    catalogueReferences: [
      {
        catalogueCode: "SG",
        catalogueNumber: `${stamp.id}-CHANGED`,
      },
    ],
  });

  await assertError(
    response,
    409,
    "CATALOGUE_REFERENCE_IN_USE",
  );

  const storedReference =
    await prisma.catalogueReference.findUniqueOrThrow({
      where: {
        id: reference.id,
      },
    });

  assert.equal(
    storedReference.catalogueNumber,
    reference.catalogueNumber,
  );

  const storedValuation =
    await prisma.catalogueValuation.findUniqueOrThrow({
      where: {
        id: valuation.id,
      },
    });

  assert.equal(
    storedValuation.catalogueReferenceId,
    reference.id,
  );

  assert.equal(
    storedValuation.amount.toFixed(2),
    "12.50",
  );

  assert.equal(
    storedValuation.currencyId,
    currency.id,
  );

  const storedStamp =
    await prisma.stamp.findUniqueOrThrow({
      where: {
        id: stamp.id,
      },
    });

  assert.equal(storedStamp.name, stamp.name);
});


test("rejects unknown catalogue definitions and rolls back changes", async () => {
  const { stamp } = await fixture();

  const response = await patch(stamp.id, {
    name: "Invalid update",
    catalogueReferences: [
      {
        catalogueCode: "NONEXISTENT",
        catalogueNumber: "123",
      },
    ],
  });

  await assertError(
    response,
    400,
    "CATALOGUE_NOT_FOUND",
  );

  const stored = await prisma.stamp.findUniqueOrThrow({
    where: {
      id: stamp.id,
    },
  });

  assert.equal(stored.name, stamp.name);
});

test("rejects malformed JSON and incorrect content types", async () => {
  const { stamp } = await fixture();

  const malformed = await PATCH(
    new Request(
      `http://localhost/api/stamps/${stamp.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: "{invalid json",
      },
    ),
    {
      params: Promise.resolve({
        id: stamp.id,
      }),
    },
  );

  await assertError(
    malformed,
    400,
    "INVALID_JSON",
  );

  const incorrectType = await PATCH(
    new Request(
      `http://localhost/api/stamps/${stamp.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "text/plain",
        },
        body: '{"colour":"Blue"}',
      },
    ),
    {
      params: Promise.resolve({
        id: stamp.id,
      }),
    },
  );

  await assertError(
    incorrectType,
    400,
    "INVALID_CONTENT_TYPE",
  );
});

test("rejects updates without explicit mutation permission", async () => {
  const { stamp } = await fixture();

  const original =
    process.env.ALLOW_DEV_MUTATIONS;

  try {
    delete process.env.ALLOW_DEV_MUTATIONS;

    const response = await patch(stamp.id, {
      colour: "Blue",
    });

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

  const stored = await prisma.stamp.findUniqueOrThrow({
    where: {
      id: stamp.id,
    },
  });

  assert.equal(stored.colour, stamp.colour);
});

test("rejects a year incompatible with an existing leap-day issue date", async () => {
  const { stamp } = await fixture({
    issueMonth: 2,
    issueDay: 29,
  });

  const response = await patch(stamp.id, {
    year: 2021,
  });

  await assertError(
    response,
    400,
    "INVALID_ISSUE_DATE",
  );

  const stored = await prisma.stamp.findUniqueOrThrow({
    where: {
      id: stamp.id,
    },
  });

  assert.equal(stored.year, 2020);
  assert.equal(stored.issueMonth, 2);
  assert.equal(stored.issueDay, 29);

  // Changing to another leap year is valid.
  const valid = await patch(stamp.id, {
    year: 2024,
  });

  assert.equal(valid.status, 200);
});
