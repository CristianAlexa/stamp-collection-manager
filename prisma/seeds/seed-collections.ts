import type { Prisma } from "../../src/generated/prisma/client";

// Fictional development collectors.
const collectors = [
  {
    email: "collector-a@example.com",
    name: "Collector A",
  },
  {
    email: "collector-b@example.com",
    name: "Collector B",
  },
];

/**
 * Populates development users, albums and personal
 * stamp collection items.
 */
export async function seedCollections(
  tx: Prisma.TransactionClient,
): Promise<void> {
  // Create or retrieve the first collector.
  const collectorA = await tx.user.upsert({
    where: { email: collectors[0].email },
    update: {},
    create: collectors[0],
  });

  // Create or retrieve the second collector.
  const collectorB = await tx.user.upsert({
    where: { email: collectors[1].email },
    update: {},
    create: collectors[1],
  });

  // Create Collector A's Great Britain album.
const albumAGB = await tx.album.upsert({
  where: {
    userId_name: {
      userId: collectorA.id,
      name: "Great Britain",
    },
  },
  update: {},
  create: {
    userId: collectorA.id,
    name: "Great Britain",
    description: "British postage stamps.",
  },
});

// Create Collector A's France album.
const albumAFrance = await tx.album.upsert({
  where: {
    userId_name: {
      userId: collectorA.id,
      name: "France",
    },
  },
  update: {},
  create: {
    userId: collectorA.id,
    name: "France",
    description: "French postage stamps.",
  },
});

// Create Collector B's Great Britain album.
const albumBGB = await tx.album.upsert({
  where: {
    userId_name: {
      userId: collectorB.id,
      name: "Great Britain",
    },
  },
  update: {},
  create: {
    userId: collectorB.id,
    name: "Great Britain",
    description: "My British stamp collection.",
  },
});

// Retrieve the currency used for development purchases.
const gbp = await tx.currency.findUniqueOrThrow({
  where: { code: "GBP" },
});

// Development collection items.
//
// Stable IDs allow repeated seeding without creating
// additional copies of the same development stamp.
const collectionItems = [
  // Collector A — Penny Black.
  {
    id: "collection-a-001",
    userId: collectorA.id,
    stampId: "stamp-001",
    albumId: albumAGB.id,
    status: "USED",
    physicalGrade: "FINE",
    purchasePrice: "85.00",
    purchaseCurrencyId: gbp.id,
    purchaseDate: new Date("2025-01-15"),
    notes: "Purchased for my British collection.",
  },

  // Collector A — Penny Red, Plate 71.
  {
    id: "collection-a-002",
    userId: collectorA.id,
    stampId: "stamp-004",
    variantId: "stamp-004-plate-71",
    albumId: albumAGB.id,
    status: "USED",
    physicalGrade: "FINE",
    purchasePrice: "2.50",
    purchaseCurrencyId: gbp.id,
  },

  // Collector A — French Bordeaux Issue.
  {
    id: "collection-a-003",
    userId: collectorA.id,
    stampId: "stamp-003",
    albumId: albumAFrance.id,
    status: "USED",
    physicalGrade: "FAIR",
    purchasePrice: "12.00",
    purchaseCurrencyId: gbp.id,
  },

  // Collector A — Unallocated Penny Red.
  {
    id: "collection-a-004",
    userId: collectorA.id,
    stampId: "stamp-002",
    status: "USED",
    physicalGrade: "FAIR",
    notes: "Waiting to be allocated to an album.",
  },

  // Collector B — Penny Black.
  {
    id: "collection-b-001",
    userId: collectorB.id,
    stampId: "stamp-001",
    albumId: albumBGB.id,
    status: "USED",
    physicalGrade: "FAIR",
    purchasePrice: "45.00",
    purchaseCurrencyId: gbp.id,
  },

  // Collector B — Penny Red, Plate 72.
  {
    id: "collection-b-002",
    userId: collectorB.id,
    stampId: "stamp-004",
    variantId: "stamp-004-plate-72",
    albumId: albumBGB.id,
    status: "USED",
    physicalGrade: "FINE",
    purchasePrice: "3.00",
    purchaseCurrencyId: gbp.id,
  },

  // Collector B — Unallocated Penny Red, Plate 71.
  {
    id: "collection-b-003",
    userId: collectorB.id,
    stampId: "stamp-004",
    variantId: "stamp-004-plate-71",
    status: "USED",
    physicalGrade: "EXTRA_FINE",
    purchasePrice: "4.50",
    purchaseCurrencyId: gbp.id,
  },
] satisfies Prisma.CollectionItemUncheckedCreateInput[];

// Populate personal collections without overwriting
// existing collection items.
for (const item of collectionItems) {
  await tx.collectionItem.upsert({
    where: { id: item.id },
    update: {},
    create: item,
  });
}
}
