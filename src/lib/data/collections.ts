import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Optional personal collection filters.
 *
 * undefined = all collection items
 * null      = unallocated collection items
 * string    = items belonging to a specific album
 */
type CollectionFilters = {
  albumId?: string | null;
};

/**
 * Shared relation configuration for collection queries.
 */
const collectionItemInclude = {
  stamp: {
    include: {
      country: true,
      catalogueReferences: {
        include: {
          catalogue: true,
        },
      },
    },
  },

  variant: {
    include: {
      attributes: {
        include: {
          value: {
            include: {
              variationType: true,
            },
          },
        },
      },
    },
  },

  album: true,
  purchaseCurrency: true,
  marketCurrency: true,
  images: true,
} satisfies Prisma.CollectionItemInclude;

/**
 * Retrieves a collector's personal collection.
 *
 * Supports filtering by album or unallocated stamps.
 */
export async function getUserCollection(
  userId: string,
  filters: CollectionFilters = {},
) {
  return prisma.collectionItem.findMany({
    where: {
      userId,

      ...(filters.albumId !== undefined
        ? { albumId: filters.albumId }
        : {}),
    },

    include: collectionItemInclude,

    orderBy: [
      { createdAt: "desc" },
      { id: "asc" },
    ],
  });
}

/**
 * Retrieves one collection item belonging to a user.
 */
export async function getUserCollectionItemById(
  userId: string,
  collectionItemId: string,
) {
  return prisma.collectionItem.findFirst({
    where: {
      id: collectionItemId,
      userId,
    },
    include: collectionItemInclude,
  });
}

/**
 * Retrieves collection items that have no album.
 */
export async function getUnallocatedCollectionItems(
  userId: string,
) {
  return getUserCollection(userId, {
    albumId: null,
  });
}

/**
 * Retrieves collection statistics for one collector.
 */
export async function getCollectionStatistics(
  userId: string,
) {
  // Group owned stamps by their album assignment.
  const groups = await prisma.collectionItem.groupBy({
    by: ["albumId"],
    where: {
      userId,
    },
    _count: {
      _all: true,
    },
  });

  const totalItems = groups.reduce(
    (total, group) => total + group._count._all,
    0,
  );

  const unallocatedItems =
    groups.find((group) => group.albumId === null)
      ?._count._all ?? 0;

  const totalAlbums = await prisma.album.count({
    where: {
      userId,
    },
  });

  return {
    totalItems,
    allocatedItems: totalItems - unallocatedItems,
    unallocatedItems,
    totalAlbums,
  };
}

// Automatically derive the returned collection item type.
export type CollectionItemDetails = Awaited<
  ReturnType<typeof getUserCollection>
>[number];