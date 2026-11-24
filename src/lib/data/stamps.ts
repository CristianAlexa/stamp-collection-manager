import "server-only";

import { prisma } from "@/lib/prisma";
import type { Stamp } from "@/types/stamp";

/**
 * Retrieves shared catalogue stamps.
 *
 * Converts database records into the existing
 * application Stamp interface.
 */
export async function getCatalogueStamps(): Promise<Stamp[]> {
  const records = await prisma.stamp.findMany({
    select: {
      id: true,
      name: true,
      country: {
        select: {
          name: true,
          code: true,
        },
      },
      catalogueReferences: {
        select: {
          catalogueNumber: true,
          catalogue: {
            select: {
              code: true,
            },
          },
        },
        orderBy: {
          catalogue: {
            code: "asc",
          },
        },
      },
      year: true,
      description: true,
    },
    orderBy: [
      { year: "asc" },
      { id: "asc" },
    ],
  });

  // Convert PostgreSQL records into application objects.
  return records.map((record) => {
    // Build human-readable catalogue references.
    const references = record.catalogueReferences.map(
      (reference) =>
        `${reference.catalogue.code}-${record.country.code ?? record.country.name}-${reference.catalogueNumber}`,
    );

    // Prefer Stanley Gibbons for unnamed stamps.
    const preferredReference =
      references.find((reference) =>
        reference.startsWith("SG-"),
      ) ?? references[0];

    return {
      id: record.id,
      name:
        record.name ??
        preferredReference ??
        "Unidentified stamp",
      country: record.country.name,
      year: record.year,
      catalogueReferences: references,
      ...(record.description === null
        ? {}
        : { description: record.description }),
    };
  });
}


/**
 * Retrieves detailed information about one catalogue stamp,
 * including its related attributes and variations.
 *
 * Returns null if the stamp does not exist.
 */
export async function getCatalogueStampById(stampId: string) {
  return prisma.stamp.findUnique({
    where: {
      id: stampId,
    },
    include: {
      country: true,
      stampType: true,
      perforation: true,
      watermark: true,

      catalogueReferences: {
        include: {
          catalogue: true,
        },
      },

      variants: {
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
        orderBy: {
          name: "asc",
        },
      },
    },
  });
}