import "dotenv/config";
import assert from "node:assert/strict";

import { prisma } from "../src/lib/prisma";

import {
  getCatalogueStamps,
  getCatalogueStampById,
} from "../src/lib/data/stamps";

import {
  getUserAlbums,
  getUserAlbumById,
} from "../src/lib/data/albums";

import {
  getUserCollection,
  getUserCollectionItemById,
  getUnallocatedCollectionItems,
  getCollectionStatistics,
} from "../src/lib/data/collections";

async function main() {
  // Retrieve our fictional development collectors.
  const collectorA = await prisma.user.findUniqueOrThrow({
    where: {
      email: "collector-a@example.com",
    },
  });

  const collectorB = await prisma.user.findUniqueOrThrow({
    where: {
      email: "collector-b@example.com",
    },
  });

  // Verify shared catalogue access.
  const stamps = await getCatalogueStamps();

  assert.equal(stamps.length, 4);

  const pennyRed = await getCatalogueStampById(
    "stamp-004",
  );

  assert.ok(pennyRed);
  assert.equal(pennyRed.variants.length, 2);

  console.log("PASS: Catalogue queries");

  // Verify personal albums.
  const albumsA = await getUserAlbums(collectorA.id);
  const albumsB = await getUserAlbums(collectorB.id);

  assert.equal(albumsA.length, 2);
  assert.equal(albumsB.length, 1);

  // Collector A must not retrieve Collector B's album.
  const foreignAlbum = await getUserAlbumById(
    collectorA.id,
    albumsB[0].id,
  );

  assert.equal(foreignAlbum, null);

  console.log("PASS: User-scoped album queries");

  // Verify personal collections.
  const itemsA = await getUserCollection(collectorA.id);
  const itemsB = await getUserCollection(collectorB.id);

  assert.equal(itemsA.length, 4);
  assert.equal(itemsB.length, 3);

  assert.ok(
    itemsA.every((item) => item.userId === collectorA.id),
  );

  assert.ok(
    itemsB.every((item) => item.userId === collectorB.id),
  );

  // Collector A must not retrieve Collector B's item.
  const foreignItem = await getUserCollectionItemById(
    collectorA.id,
    "collection-b-001",
  );

  assert.equal(foreignItem, null);

  console.log("PASS: User-scoped collection queries");

  // Verify album filtering.
  const britishAlbum = albumsA.find(
    (album) => album.name === "Great Britain",
  );

  assert.ok(britishAlbum);

  const albumItems = await getUserCollection(
    collectorA.id,
    { albumId: britishAlbum.id },
  );

  assert.equal(albumItems.length, 2);

  console.log("PASS: Album filtering");

  // Verify unallocated items.
  const unallocatedA =
    await getUnallocatedCollectionItems(collectorA.id);

  const unallocatedB =
    await getUnallocatedCollectionItems(collectorB.id);

  assert.equal(unallocatedA.length, 1);
  assert.equal(unallocatedB.length, 1);

  assert.equal(unallocatedA[0].albumId, null);
  assert.equal(unallocatedB[0].albumId, null);

  console.log("PASS: Unallocated collection queries");

  // Verify collection statistics.
  const statsA = await getCollectionStatistics(
    collectorA.id,
  );

  const statsB = await getCollectionStatistics(
    collectorB.id,
  );

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

  console.log("PASS: Collection statistics");

  console.table({
    "Collector A": statsA,
    "Collector B": statsB,
  });

  console.log("All data access checks passed.");
}

main()
  .catch((error: unknown) => {
    console.error("Data access checks failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });