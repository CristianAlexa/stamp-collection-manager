import "server-only";

import { prisma } from "@/lib/prisma";
import type { Stamp } from "@/types/stamp";
import type { StampDetail } from "@/types/stamp-detail";
import { getEffectiveStampColour } from "@/lib/stamp-colour";
import type { Prisma } from "@/generated/prisma/client";
import type { CreateStampInput, UpdateStampInput } from "@/lib/stamp-mutation-schema";

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
export async function getCatalogueStampById(
  stampId: string,
  db: Prisma.TransactionClient = prisma,
) {
  return db.stamp.findUnique({
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


/**
 * Returns a JSON-compatible catalogue stamp detail DTO.
 *
 * Reuses the existing relational database query.
 * Returns null when the catalogue stamp does not exist.
 */
export async function getCatalogueStampDetail(
  stampId: string,
  db: Prisma.TransactionClient = prisma,
): Promise<StampDetail | null> {
  const record = await getCatalogueStampById(stampId, db);

  if (!record) {
    return null;
  }

  const catalogueReferences = record.catalogueReferences
    .map((reference) => ({
      catalogueCode: reference.catalogue.code,
      catalogueName: reference.catalogue.name,
      catalogueNumber: reference.catalogueNumber,
      reference:
        `${reference.catalogue.code}-` +
        `${record.country.code ?? record.country.name}-` +
        `${reference.catalogueNumber}`,
    }))
    .sort((a, b) =>
      a.catalogueCode.localeCompare(b.catalogueCode),
    );

  // Preserve the existing preferred-name behaviour.
  const preferredReference =
    catalogueReferences.find(
      (reference) => reference.catalogueCode === "SG",
    ) ?? catalogueReferences[0];

  return {
    id: record.id,

    name:
      record.name ??
      preferredReference?.reference ??
      "Unidentified stamp",

    description: record.description,

    year: record.year,
    issueMonth: record.issueMonth,
    issueDay: record.issueDay,

    country: {
      id: record.country.id,
      name: record.country.name,
      code: record.country.code,
      flagUrl: record.country.flagUrl,
      description: record.country.description,
    },

    faceValue: record.faceValue,
    colour: record.colour,

    widthMm: record.widthMm?.toString() ?? null,
    heightMm: record.heightMm?.toString() ?? null,

    stampType: record.stampType
      ? {
          id: record.stampType.id,
          name: record.stampType.name,
        }
      : null,

    watermarkStatus: record.watermarkStatus,
    watermarkOrientation: record.watermarkOrientation,

    watermark: record.watermark
      ? {
          id: record.watermark.id,
          name: record.watermark.name,
          description: record.watermark.description,
          imageUrl: record.watermark.imageUrl,
        }
      : null,

    perforationType: record.perforationType,

    perforation: record.perforation
      ? {
          id: record.perforation.id,
          name: record.perforation.name,
          horizontal:
            record.perforation.horizontal?.toString() ?? null,
          vertical:
            record.perforation.vertical?.toString() ?? null,
        }
      : null,

    catalogueReferences,

    variants: record.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      description: variant.description,

      colour: variant.colour,

      effectiveColour: getEffectiveStampColour(
        record.colour,
        variant.colour,
      ),

      attributes: variant.attributes.map((attribute) => ({
        type: attribute.value.variationType.name,
        value: attribute.value.value,
      })),
    })),
  };
}


/**
 * Represents an expected catalogue relationship error.
 */


/**
 * Represents an expected catalogue write error.
 */
export class CatalogueWriteError extends Error {
  constructor(
    public readonly code:
      | "COUNTRY_NOT_FOUND"
      | "CATALOGUE_NOT_FOUND"
      | "STAMP_NOT_FOUND"
      | "CATALOGUE_REFERENCE_IN_USE"
      | "INVALID_ISSUE_DATE"
      | "STAMP_IN_COLLECTION"
      | "STAMP_HAS_VARIANTS"
      | "STAMP_HAS_IMAGES"
      | "STAMP_HAS_VALUATIONS",
    message: string,
  ) {
    super(message);
    this.name = "CatalogueWriteError";
  }
}



/**
 * Resolves catalogue codes into database IDs.
 */
async function resolveCatalogueReferences(
  tx: Prisma.TransactionClient,
  input: CreateStampInput["catalogueReferences"],
) {
  const catalogues = await tx.catalogue.findMany({
    where: {
      code: {
        in: input.map(
          (reference) => reference.catalogueCode,
        ),
      },
    },
    select: {
      id: true,
      code: true,
    },
  });

  const catalogueIds = new Map(
    catalogues.map((catalogue) => [
      catalogue.code,
      catalogue.id,
    ]),
  );

  return input.map((reference) => {
    const catalogueId = catalogueIds.get(
      reference.catalogueCode,
    );

    if (!catalogueId) {
      throw new CatalogueWriteError(
        "CATALOGUE_NOT_FOUND",
        `Catalogue ${reference.catalogueCode} does not exist.`,
      );
    }

    return {
      catalogueId,
      catalogueNumber: reference.catalogueNumber,
    };
  });
}



/**
 * Creates a catalogue stamp and its references
 * within one atomic database transaction.
 */
export async function createCatalogueStamp(
  input: CreateStampInput,
): Promise<StampDetail> {
  return prisma.$transaction(async (tx) => {
    // Validate the issuing country.
    const country = await tx.country.findUnique({
      where: {
        id: input.countryId,
      },
      select: {
        id: true,
      },
    });

    if (!country) {
      throw new CatalogueWriteError(
        "COUNTRY_NOT_FOUND",
        "The selected country does not exist.",
      );
    }

    const references = await resolveCatalogueReferences(
      tx,
      input.catalogueReferences,
    );

    // Create the shared catalogue stamp.
    const stamp = await tx.stamp.create({
      data: {
        name: input.name ?? null,
        description: input.description ?? null,
        countryId: country.id,
        year: input.year,
        faceValue: input.faceValue ?? null,
        colour: input.colour ?? null,

        // Do not assume an unknown watermark is absent.
        watermarkStatus: "UNKNOWN",
      },
      select: {
        id: true,
      },
    });

    // Create all requested catalogue references.
    if (references.length > 0) {
      await tx.catalogueReference.createMany({
        data: references.map((reference) => ({
          stampId: stamp.id,
          countryId: country.id,
          catalogueId: reference.catalogueId,
          catalogueNumber:
            reference.catalogueNumber,
        })),
      });
    }

    // Retrieve the complete application-facing DTO
    // using the same transaction.
    const detail = await getCatalogueStampDetail(
      stamp.id,
      tx,
    );

    if (!detail) {
      throw new Error(
        "Could not retrieve the newly created stamp.",
      );
    }

    return detail;
  });
}

/**
 * Partially updates a shared catalogue stamp.
 *
 * Existing catalogue reference IDs are preserved.
 * References with historical valuations cannot
 * be renumbered.
 */
export async function updateCatalogueStamp(
  stampId: string,
  input: UpdateStampInput,
): Promise<StampDetail> {
  return prisma.$transaction(
    async (tx) => {
      const stamp = await tx.stamp.findUnique({
        where: {
          id: stampId,
        },
        select: {
          id: true,
          countryId: true,
          issueMonth: true,
          issueDay: true,
        },
      });

      if (!stamp) {
        throw new CatalogueWriteError(
          "STAMP_NOT_FOUND",
          "The requested stamp does not exist.",
        );
      }

      // Protect an existing leap-day issue date.
      if (
        input.year !== undefined &&
        stamp.issueMonth === 2 &&
        stamp.issueDay === 29
      ) {
        const isLeapYear =
          input.year % 4 === 0 &&
          (
            input.year % 100 !== 0 ||
            input.year % 400 === 0
          );

        if (!isLeapYear) {
          throw new CatalogueWriteError(
            "INVALID_ISSUE_DATE",
            "The new year is incompatible with the existing issue date.",
          );
        }
      }

      // Separate scalar fields from relationships.
      const {
        catalogueReferences,
        ...fields
      } = input;

      // Update only fields supplied by the client.
      if (Object.keys(fields).length > 0) {
        await tx.stamp.update({
          where: {
            id: stamp.id,
          },
          data: fields,
        });
      }

      // Add or update supplied references.
      if (catalogueReferences !== undefined) {
        const references =
          await resolveCatalogueReferences(
            tx,
            catalogueReferences,
          );

        for (const reference of references) {
          const existing =
            await tx.catalogueReference.findUnique({
              where: {
                stampId_catalogueId: {
                  stampId: stamp.id,
                  catalogueId:
                    reference.catalogueId,
                },
              },
              select: {
                id: true,
                catalogueNumber: true,
                _count: {
                  select: {
                    valuations: true,
                  },
                },
              },
            });

          // Add a new reference.
          if (!existing) {
            await tx.catalogueReference.create({
              data: {
                stampId: stamp.id,
                countryId: stamp.countryId,
                catalogueId:
                  reference.catalogueId,
                catalogueNumber:
                  reference.catalogueNumber,
              },
            });

            continue;
          }

          // No change is necessary.
          if (
            existing.catalogueNumber ===
            reference.catalogueNumber
          ) {
            continue;
          }

          // Protect historical catalogue valuations.
          if (existing._count.valuations > 0) {
            throw new CatalogueWriteError(
              "CATALOGUE_REFERENCE_IN_USE",
              "A catalogue reference with historical valuations cannot be renumbered.",
            );
          }

          // Correct the number without changing its ID.
          await tx.catalogueReference.update({
            where: {
              id: existing.id,
            },
            data: {
              catalogueNumber:
                reference.catalogueNumber,
            },
          });
        }
      }

      // Return the complete updated DTO.
      const detail = await getCatalogueStampDetail(
        stamp.id,
        tx,
      );

      if (!detail) {
        throw new Error(
          "Could not retrieve the updated stamp.",
        );
      }

      return detail;
    },
    {
      isolationLevel: "Serializable",
    },
  );
}


/**
 * Safely deletes a shared catalogue stamp.
 *
 * Personal collections, historical valuations,
 * variations and images must remain protected.
 */
export async function deleteCatalogueStamp(
  stampId: string,
): Promise<void> {
  await prisma.$transaction(
    async (tx) => {
      // Check whether the stamp exists and
      // identify protected direct dependencies.
      const stamp = await tx.stamp.findUnique({
        where: {
          id: stampId,
        },
        select: {
          id: true,
          _count: {
            select: {
              collectionItems: true,
              variants: true,
              images: true,
            },
          },
        },
      });

      if (!stamp) {
        throw new CatalogueWriteError(
          "STAMP_NOT_FOUND",
          "The requested stamp does not exist.",
        );
      }

      // Protect personal collections.
      if (stamp._count.collectionItems > 0) {
        throw new CatalogueWriteError(
          "STAMP_IN_COLLECTION",
          "This stamp belongs to a personal collection and cannot be deleted.",
        );
      }

      // Protect explicit stamp variations.
      if (stamp._count.variants > 0) {
        throw new CatalogueWriteError(
          "STAMP_HAS_VARIANTS",
          "This stamp has variations and cannot be deleted.",
        );
      }

      // Protect shared catalogue images.
      if (stamp._count.images > 0) {
        throw new CatalogueWriteError(
          "STAMP_HAS_IMAGES",
          "This stamp has catalogue images and cannot be deleted.",
        );
      }

      // Protect historical valuations associated
      // with any of the stamp's catalogue references.
      const valuedReference =
        await tx.catalogueReference.findFirst({
          where: {
            stampId: stamp.id,
            valuations: {
              some: {},
            },
          },
          select: {
            id: true,
          },
        });

      if (valuedReference) {
        throw new CatalogueWriteError(
          "STAMP_HAS_VALUATIONS",
          "This stamp has historical catalogue valuations and cannot be deleted.",
        );
      }

      // Remove theme associations only.
      await tx.stampTheme.deleteMany({
        where: {
          stampId: stamp.id,
        },
      });

      // Remove catalogue references that have
      // no dependent historical valuations.
      await tx.catalogueReference.deleteMany({
        where: {
          stampId: stamp.id,
        },
      });

      // Delete the shared catalogue record.
      await tx.stamp.delete({
        where: {
          id: stamp.id,
        },
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );
}