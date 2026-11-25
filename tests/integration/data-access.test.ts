import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { prisma } from "../../src/lib/prisma";
import { getEffectiveStampColour } from "../../src/lib/stamp-colour";

import {
  getCatalogueStamps,
  getCatalogueStampById,
} from "../../src/lib/data/stamps";

import {
  getUserAlbums,
  getUserAlbumById,
} from "../../src/lib/data/albums";

import {
  getUserCollection,
  getUserCollectionItemById,
  getUnallocatedCollectionItems,
  getCollectionStatistics,
} from "../../src/lib/data/collections";

// Refuse to run integration tests against another database.
const databaseUrl = new URL(
  process.env.DATABASE_URL ?? "",
);

assert.equal(databaseUrl.hostname, "127.0.0.1");
assert.equal(databaseUrl.port, "5434");
assert.equal(
  databaseUrl.pathname,
  "/stamp_collection_test",
);

let collectorAId: string;
let collectorBId: string;

// Retrieve the seeded test users before running tests.
before(async () => {
  const collectorA =
    await prisma.user.findUniqueOrThrow({
      where: {
        email: "collector-a@example.com",
      },
    });

  const collectorB =
    await prisma.user.findUniqueOrThrow({
      where: {
        email: "collector-b@example.com",
      },
    });

  collectorAId = collectorA.id;
  collectorBId = collectorB.id;
});

// Close the database connection after all tests.
after(async () => {
  await prisma.$disconnect();
});

test("retrieves the shared stamp catalogue", async () => {
  const stamps = await getCatalogueStamps();

  assert.equal(stamps.length, 4);

  assert.ok(
    stamps.some((stamp) =>
      stamp.catalogueReferences?.includes(
        "SG-GB-43",
      ),
    ),
  );
});

test("retrieves Penny Red and its plate variations", async () => {
  const stamp = await getCatalogueStampById(
    "stamp-004",
  );

  assert.ok(stamp);
  assert.equal(stamp.year, 1864);

  assert.deepEqual(
    stamp.variants.map((variant) => variant.name),
    ["Plate 71", "Plate 72"],
  );
});

test("returns null for an unknown catalogue stamp", async () => {
  const stamp = await getCatalogueStampById(
    "nonexistent-stamp",
  );

  assert.equal(stamp, null);
});

test("retrieves only the collector's albums", async () => {
  const albumsA = await getUserAlbums(collectorAId);
  const albumsB = await getUserAlbums(collectorBId);

  assert.equal(albumsA.length, 2);
  assert.equal(albumsB.length, 1);
});

test("prevents access to another collector's album", async () => {
  const albumsB = await getUserAlbums(collectorBId);

  const album = await getUserAlbumById(
    collectorAId,
    albumsB[0].id,
  );

  assert.equal(album, null);
});

test("retrieves only the collector's owned stamps", async () => {
  const itemsA = await getUserCollection(collectorAId);
  const itemsB = await getUserCollection(collectorBId);

  assert.equal(itemsA.length, 4);
  assert.equal(itemsB.length, 3);

  assert.ok(
    itemsA.every(
      (item) => item.userId === collectorAId,
    ),
  );

  assert.ok(
    itemsB.every(
      (item) => item.userId === collectorBId,
    ),
  );
});

test("prevents access to another collector's item", async () => {
  const item = await getUserCollectionItemById(
    collectorAId,
    "collection-b-001",
  );

  assert.equal(item, null);
});

test("filters collection items by an owned album", async () => {
  const albums = await getUserAlbums(collectorAId);

  const britishAlbum = albums.find(
    (album) => album.name === "Great Britain",
  );

  assert.ok(britishAlbum);

  const items = await getUserCollection(
    collectorAId,
    { albumId: britishAlbum.id },
  );

  assert.equal(items.length, 2);
});

test("returns no items for another collector's album", async () => {
  const albumsB = await getUserAlbums(collectorBId);

  const items = await getUserCollection(
    collectorAId,
    { albumId: albumsB[0].id },
  );

  assert.deepEqual(items, []);
});

test("retrieves unallocated stamps", async () => {
  const itemsA =
    await getUnallocatedCollectionItems(collectorAId);

  const itemsB =
    await getUnallocatedCollectionItems(collectorBId);

  assert.equal(itemsA.length, 1);
  assert.equal(itemsB.length, 1);

  assert.equal(itemsA[0].albumId, null);
  assert.equal(itemsB[0].albumId, null);
});

test("calculates independent collection statistics", async () => {
  const statsA =
    await getCollectionStatistics(collectorAId);

  const statsB =
    await getCollectionStatistics(collectorBId);

  assert.deepEqual(statsA, {
    totalItems: 4,
    allocatedItems: 3,
    unallocatedItems: 1,
    totalAlbums: 2,
  });

  assert.deepEqual(statsB, {
    totalItems: 3,
    allocatedItems: 2,
    unallocatedItems: 1,
    totalAlbums: 1,
  });
});

test("returns empty results for an unknown collector", async () => {
  const userId = "nonexistent-collector";

  assert.deepEqual(
    await getUserAlbums(userId),
    [],
  );

  assert.deepEqual(
    await getUserCollection(userId),
    [],
  );

  assert.deepEqual(
    await getCollectionStatistics(userId),
    {
      totalItems: 0,
      allocatedItems: 0,
      unallocatedItems: 0,
      totalAlbums: 0,
    },
  );
});

test("returns refined catalogue properties", async () => {
  const stamps = await getCatalogueStamps();

  const pennyBlack = stamps.find(
    (stamp) => stamp.id === "stamp-001",
  );

  assert.ok(pennyBlack);
  assert.equal(pennyBlack.faceValue, "1d");
  assert.equal(pennyBlack.colour, "Black");
});

test("preserves missing catalogue characteristics as null", async () => {
  const stamps = await getCatalogueStamps();

  const bordeaux = stamps.find(
    (stamp) => stamp.id === "stamp-003",
  );

  assert.ok(bordeaux);
  assert.equal(bordeaux.faceValue, null);
  assert.equal(bordeaux.colour, null);
});

test("maps country metadata into catalogue results", async () => {
  const stamps = await getCatalogueStamps();

  const pennyBlack = stamps.find(
    (stamp) => stamp.id === "stamp-001",
  );

  assert.ok(pennyBlack);

  const country = await prisma.country.findUniqueOrThrow({
    where: {
      name: "Great Britain",
    },
  });

  assert.equal(
    pennyBlack.countryFlagUrl,
    country.flagUrl,
  );

  assert.equal(
    pennyBlack.countryDescription,
    country.description,
  );
});

test("inherits catalogue colour for plate variants", async () => {
  const stamp = await getCatalogueStampById("stamp-004");

  assert.ok(stamp);
  assert.equal(stamp.colour, "Rose Red");
  assert.equal(stamp.faceValue, "1d");
  assert.equal(stamp.variants.length, 2);

  for (const variant of stamp.variants) {
    assert.equal(variant.colour, null);

    assert.equal(
      getEffectiveStampColour(
        stamp.colour,
        variant.colour,
      ),
      "Rose Red",
    );
  }
});

test("preserves financial currency relationships", async () => {
  const items = await getUserCollection(collectorAId);

  assert.ok(items.length > 0);

  for (const item of items) {
    assert.ok("purchaseCurrency" in item);
    assert.ok("marketCurrency" in item);

    assert.ok("faceValue" in item.stamp);
    assert.ok("colour" in item.stamp);
  }
});