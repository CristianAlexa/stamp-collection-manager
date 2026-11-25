import "server-only";

import { prisma } from "@/lib/prisma";
import type { Stamp } from "@/types/stamp";

/**
 * Retrieves shared catalogue stamps.
 *
 * Converts database records into the existing
 * application Stamp interface.
 */
/**
 * Retrieves shared catalogue stamps.
 *
 * Converts database records into the application-facing
 * Stamp interface.
 */
export async function getCatalogueStamps(): Promise<Stamp[]> {
  const records = await prisma.stamp.findMany({
    select: {
      id: true,
      name: true,
      year: true,
      description: true,

      // Refined catalogue properties.
      faceValue: true,
      colour: true,

      country: {
        select: {
          name: true,
          code: true,
          flagUrl: true,
          description: true,
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
    },

    orderBy: [
      { year: "asc" },
      { id: "asc" },
    ],
  });

  // Convert database records into application objects.
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

      // Preserve existing catalogue references.
      catalogueReferences: references,

      // Expose the refined database properties.
      faceValue: record.faceValue,
      colour: record.colour,

      countryFlagUrl: record.country.flagUrl,
      countryDescription: record.country.description,

      // Preserve existing description behaviour.
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