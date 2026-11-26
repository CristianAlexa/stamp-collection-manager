
import assert from "node:assert/strict";
import {
  after,
  afterEach,
  before,
  test,
} from "node:test";
import { randomUUID } from "node:crypto";

import { prisma } from "../../src/lib/prisma";
import {
  DELETE,
  GET,
} from "../../src/app/api/stamps/[id]/route";

import type {
  ApiErrorResponse,
} from "../../src/types/api";

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

const marker = `DELETE-TEST-${randomUUID()}`;

const stampIds = new Set<string>();
const editionIds = new Set<string>();

let countryId: string;
let sgId: string;
let scId: string;
let collectorId: string;
let currencyId: string;

before(async () => {
  const [country, sg, sc, collector, currency] =
    await Promise.all([
      prisma.country.findUniqueOrThrow({
        where: { name: "Great Britain" },
      }),

      prisma.catalogue.findUniqueOrThrow({
        where: { code: "SG" },
      }),

      prisma.catalogue.findUniqueOrThrow({
        where: { code: "SC" },
      }),

      prisma.user.findFirstOrThrow({
        orderBy: { id: "asc" },
      }),

      prisma.currency.findUniqueOrThrow({
        where: { code: "GBP" },
      }),
    ]);

  countryId = country.id;
  sgId = sg.id;
  scId = sc.id;
  collectorId = collector.id;
  currencyId = currency.id;

  console.log("Delete fixture marker:", marker);
});



/**
 * Creates a temporary catalogue stamp.
 */
async function makeStamp() {
  const id = `${marker}-${randomUUID()}`;

  // Track the ID before attempting creation.
  stampIds.add(id);

  return prisma.stamp.create({
    data: {
      id,
      name: "Temporary deletion stamp",
      description: marker,
      countryId,
      year: 2020,
      colour: "Blue",
      watermarkStatus: "UNKNOWN",
    },
  });
}

/**
 * Creates a stamp with one catalogue reference.
 */
async function fixture() {
  const stamp = await makeStamp();

  const reference =
    await prisma.catalogueReference.create({
      data: {
        stampId: stamp.id,
        countryId,
        catalogueId: sgId,
        catalogueNumber: `${stamp.id}-SG`,
      },
    });

  return {
    stamp,
    reference,
  };
}

/**
 * Creates a temporary owned stamp.
 */
async function makeCollectionItem(
  stampId: string,
) {
  return prisma.collectionItem.create({
    data: {
      userId: collectorId,
      stampId,
      status: "USED",
      notes: marker,
    },
  });
}

/**
 * Calls the actual DELETE route handler.
 */
function remove(id: string) {
  return DELETE(
    new Request(
      `http://localhost/api/stamps/${id}`,
      {
        method: "DELETE",
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
 * Verifies that a protected stamp and its
 * original catalogue reference still exist.
 */
async function assertPreserved(
  stampId: string,
  referenceId: string,
) {
  const stamp = await prisma.stamp.findUnique({
    where: { id: stampId },
  });

  const reference =
    await prisma.catalogueReference.findUnique({
      where: { id: referenceId },
    });

  assert.ok(stamp);
  assert.ok(reference);
  assert.equal(reference.stampId, stampId);
}



/**
 * Cleans up temporary test dependencies
 * before removing their parent stamps.
 */
afterEach(async () => {
  const ids = [...stampIds];

  await prisma.$transaction([
    prisma.catalogueValuation.deleteMany({
      where: {
        stampId: { in: ids },
      },
    }),

    prisma.catalogueImage.deleteMany({
      where: {
        stampId: { in: ids },
      },
    }),

    prisma.collectionItem.deleteMany({
      where: {
        stampId: { in: ids },
      },
    }),

    prisma.stampVariant.deleteMany({
      where: {
        stampId: { in: ids },
      },
    }),

    prisma.stampTheme.deleteMany({
      where: {
        stampId: { in: ids },
      },
    }),

    prisma.catalogueReference.deleteMany({
      where: {
        stampId: { in: ids },
      },
    }),

    prisma.stamp.deleteMany({
      where: {
        id: { in: ids },
      },
    }),

    prisma.catalogueEdition.deleteMany({
      where: {
        id: { in: [...editionIds] },
      },
    }),
  ]);

  stampIds.clear();
  editionIds.clear();
});

after(async () => {
  await prisma.$disconnect();
});


test("deletes an unused catalogue stamp with no response body", async () => {
  const stamp = await makeStamp();

  const response = await remove(stamp.id);

  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");

  const stored = await prisma.stamp.findUnique({
    where: {
      id: stamp.id,
    },
  });

  assert.equal(stored, null);

  // Confirm that the GET endpoint also
  // reports that the stamp no longer exists.
  const detailResponse = await GET(
    new Request(
      `http://localhost/api/stamps/${stamp.id}`,
    ),
    {
      params: Promise.resolve({
        id: stamp.id,
      }),
    },
  );

  await assertError(
    detailResponse,
    404,
    "STAMP_NOT_FOUND",
  );
});



test("deletes unused references and theme associations", async () => {
  const { stamp, reference } = await fixture();

  const secondReference =
    await prisma.catalogueReference.create({
      data: {
        stampId: stamp.id,
        countryId,
        catalogueId: scId,
        catalogueNumber: `${stamp.id}-SC`,
      },
    });

  const theme = await prisma.theme.findFirstOrThrow({
    orderBy: {
      name: "asc",
    },
  });

  await prisma.stampTheme.create({
    data: {
      stampId: stamp.id,
      themeId: theme.id,
    },
  });

  const response = await remove(stamp.id);

  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");

  const stored = await prisma.stamp.findUnique({
    where: { id: stamp.id },
  });

  assert.equal(stored, null);

  const references =
    await prisma.catalogueReference.count({
      where: {
        id: {
          in: [
            reference.id,
            secondReference.id,
          ],
        },
      },
    });

  assert.equal(references, 0);

  const themeAssociations =
    await prisma.stampTheme.count({
      where: {
        stampId: stamp.id,
      },
    });

  assert.equal(themeAssociations, 0);

  // Reusable definitions must remain available.
  assert.ok(
    await prisma.theme.findUnique({
      where: { id: theme.id },
    }),
  );

  assert.ok(
    await prisma.country.findUnique({
      where: { id: countryId },
    }),
  );

  assert.equal(
    await prisma.catalogue.count({
      where: {
        id: {
          in: [sgId, scId],
        },
      },
    }),
    2,
  );
});


test("returns 404 for missing or already deleted stamps", async () => {
  await assertError(
    await remove(`missing-${randomUUID()}`),
    404,
    "STAMP_NOT_FOUND",
  );

  const stamp = await makeStamp();

  const first = await remove(stamp.id);

  assert.equal(first.status, 204);

  const second = await remove(stamp.id);

  await assertError(
    second,
    404,
    "STAMP_NOT_FOUND",
  );
});


test("rejects invalid stamp identifiers", async () => {
  const response = await remove("stamp@004");

  await assertError(
    response,
    400,
    "INVALID_STAMP_ID",
  );
});


test("protects personal collection items and their images", async () => {
  const { stamp, reference } = await fixture();

  const item = await makeCollectionItem(
    stamp.id,
  );

  const image = await prisma.collectionImage.create({
    data: {
      collectionItemId: item.id,
      imageType: "FRONT",
      storageKey: `${marker}-${randomUUID()}`,
      caption: "Temporary personal image",
    },
  });

  const response = await remove(stamp.id);

  await assertError(
    response,
    409,
    "STAMP_IN_COLLECTION",
  );

  await assertPreserved(
    stamp.id,
    reference.id,
  );

  const storedItem =
    await prisma.collectionItem.findUniqueOrThrow({
      where: {
        id: item.id,
      },
    });

  assert.equal(
    storedItem.userId,
    collectorId,
  );

  assert.equal(
    storedItem.stampId,
    stamp.id,
  );

  const storedImage =
    await prisma.collectionImage.findUniqueOrThrow({
      where: {
        id: image.id,
      },
    });

  assert.equal(
    storedImage.collectionItemId,
    item.id,
  );

  assert.equal(
    storedImage.storageKey,
    image.storageKey,
  );
});


test("protects catalogue stamp variations", async () => {
  const { stamp, reference } = await fixture();

  const variant = await prisma.stampVariant.create({
    data: {
      stampId: stamp.id,
      name: "Temporary plate variation",
      colour: "Red",
    },
  });

  const response = await remove(stamp.id);

  await assertError(
    response,
    409,
    "STAMP_HAS_VARIANTS",
  );

  await assertPreserved(
    stamp.id,
    reference.id,
  );

  const storedVariant =
    await prisma.stampVariant.findUniqueOrThrow({
      where: {
        id: variant.id,
      },
    });

  assert.equal(
    storedVariant.stampId,
    stamp.id,
  );

  assert.equal(storedVariant.colour, "Red");
});

test("protects shared catalogue images", async () => {
  const { stamp, reference } = await fixture();

  const image = await prisma.catalogueImage.create({
    data: {
      stampId: stamp.id,
      imageType: "FRONT",
      storageKey: `${marker}-${randomUUID()}`,
      caption: "Temporary catalogue image",
    },
  });

  const response = await remove(stamp.id);

  await assertError(
    response,
    409,
    "STAMP_HAS_IMAGES",
  );

  await assertPreserved(
    stamp.id,
    reference.id,
  );

  const storedImage =
    await prisma.catalogueImage.findUniqueOrThrow({
      where: {
        id: image.id,
      },
    });

  assert.equal(
    storedImage.stampId,
    stamp.id,
  );

  assert.equal(
    storedImage.storageKey,
    image.storageKey,
  );
});


test("protects historical catalogue valuations", async () => {
  const { stamp, reference } = await fixture();

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
        amount: "25.50",
        currencyId,
      },
    });

  const response = await remove(stamp.id);

  await assertError(
    response,
    409,
    "STAMP_HAS_VALUATIONS",
  );

  await assertPreserved(
    stamp.id,
    reference.id,
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
    "25.50",
  );

  assert.equal(
    storedValuation.currencyId,
    currencyId,
  );

  assert.equal(
    storedValuation.editionId,
    edition.id,
  );

  assert.ok(
    await prisma.catalogueEdition.findUnique({
      where: {
        id: edition.id,
      },
    }),
  );
});

test("rejects deletion without explicit mutation permission", async () => {
  const { stamp, reference } = await fixture();

  const original =
    process.env.ALLOW_DEV_MUTATIONS;

  try {
    delete process.env.ALLOW_DEV_MUTATIONS;

    const response = await remove(stamp.id);

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

  await assertPreserved(
    stamp.id,
    reference.id,
  );
});


test("database constraints roll back partial deletion", async () => {
  const { stamp, reference } = await fixture();

  const item = await makeCollectionItem(
    stamp.id,
  );

  // Deliberately attempt an unsafe deletion
  // directly through Prisma in the test database.
  await assert.rejects(
    prisma.$transaction(async (tx) => {
      await tx.catalogueReference.deleteMany({
        where: {
          stampId: stamp.id,
        },
      });

      // The collection item prevents this.
      await tx.stamp.delete({
        where: {
          id: stamp.id,
        },
      });
    }),
    {
      code: "P2003",
    },
  );

  // The earlier reference deletion must
  // have been rolled back.
  await assertPreserved(
    stamp.id,
    reference.id,
  );

  const storedItem =
    await prisma.collectionItem.findUniqueOrThrow({
      where: {
        id: item.id,
      },
    });

  assert.equal(
    storedItem.stampId,
    stamp.id,
  );
});
