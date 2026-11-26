import "server-only";

import { prisma } from "@/lib/prisma";
import type { Stamp } from "@/types/stamp";
import type { StampDetail } from "@/types/stamp-detail";
import { getEffectiveStampColour } from "@/lib/stamp-colour";
import type { Prisma } from "@/generated/prisma/client";
import type { CreateStampInput } from "@/lib/stamp-mutation-schema";

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
export class CatalogueWriteError extends Error {
  constructor(
    public readonly code:
      | "COUNTRY_NOT_FOUND"
      | "CATALOGUE_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "CatalogueWriteError";
  }
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

    // Retrieve the requested catalogue definitions.
    const catalogues = await tx.catalogue.findMany({
      where: {
        code: {
          in: input.catalogueReferences.map(
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

    // Validate and prepare catalogue references.
    const references = input.catalogueReferences.map(
      (reference) => {
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
      },
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
