import type { Prisma } from "../../src/generated/prisma/client";

// Development plate definitions.
const plates = ["71", "72"];

/**
 * Creates identifiable Penny Red plate variations.
 *
 * The parent stamp and variation type must already exist.
 */
export async function seedVariants(
  tx: Prisma.TransactionClient,
): Promise<void> {
  // Retrieve the 1864 Penny Red parent stamp.
  const stamp = await tx.stamp.findUniqueOrThrow({
    where: { id: "stamp-004" },
  });

  // Retrieve the reusable Plate Number variation type.
  const variationType =
    await tx.variationType.findUniqueOrThrow({
      where: { name: "Plate Number" },
    });

  for (const plate of plates) {
    // Create a reusable plate number attribute value.
    const value = await tx.variationValue.upsert({
      where: {
        variationTypeId_value: {
          variationTypeId: variationType.id,
          value: plate,
        },
      },
      update: {},
      create: {
        variationTypeId: variationType.id,
        value: plate,
      },
    });

    // Use a stable identifier to prevent duplicate variants.
    const variant = await tx.stampVariant.upsert({
      where: {
        id: `stamp-004-plate-${plate}`,
      },
      update: {},
      create: {
        id: `stamp-004-plate-${plate}`,
        stampId: stamp.id,
        name: `Plate ${plate}`,
      },
    });

    // Associate the stamp variation with its attribute.
    await tx.variantAttribute.upsert({
      where: {
        variantId_valueId: {
          variantId: variant.id,
          valueId: value.id,
        },
      },
      update: {},
      create: {
        variantId: variant.id,
        valueId: value.id,
      },
    });
  }
}