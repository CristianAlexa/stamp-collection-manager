import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Retrieves all albums belonging to a specific collector.
 */
export async function getUserAlbums(userId: string) {
  return prisma.album.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,

      // Count the physical stamps inside each album.
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Retrieves an individual album belonging to a collector.
 *
 * Returns null for an unknown or unauthorised album ID.
 */
export async function getUserAlbumById(
  userId: string,
  albumId: string,
) {
  return prisma.album.findUnique({
    where: {
      id_userId: {
        id: albumId,
        userId,
      },
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });
}