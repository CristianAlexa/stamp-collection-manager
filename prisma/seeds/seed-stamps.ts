import type { Prisma } from "../../src/generated/prisma/client";

import { stamps } from "../../src/lib/stamp-data";

/**
 * Populates the sample stamp catalogue.
 *
 * Reference data must be seeded before calling
 * this function.
 */
export async function seedStamps(
  tx: Prisma.TransactionClient,
): Promise<void> {
  for (const stamp of stamps) {
    // Retrieve the issuing country.
    // Throws an error if the country does not exist.
    const country = await tx.country.findUniqueOrThrow({
      where: {
        name: stamp.country,
      },
    });

    // Create the sample stamp if it does not exist.
    await tx.stamp.upsert({
      where: { id: stamp.id },
      update: {},
      create: {
        id: stamp.id,
        name: stamp.name,
        countryId: country.id,
        year: stamp.year,
        description: stamp.description,
      },
    });
  }
}