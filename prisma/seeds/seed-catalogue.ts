import type { Prisma } from "../../src/generated/prisma/client";

/**
 * Enriches the development stamp catalogue with
 * reusable reference data and catalogue information.
 */
export async function seedCatalogue(
  tx: Prisma.TransactionClient,
): Promise<void> {
  // Retrieve the required reference records.
  const country = await tx.country.findUniqueOrThrow({
    where: { code: "GB" },
  });

  const currency = await tx.currency.findUniqueOrThrow({
    where: { code: "GBX-OLD" },
  });

  const stampType = await tx.stampType.findUniqueOrThrow({
    where: { name: "Definitive" },
  });

  const catalogue = await tx.catalogue.findUniqueOrThrow({
    where: { code: "SG" },
  });

  const perforation = await tx.perforation.findUniqueOrThrow({
    where: { name: "14" },
  });

  // Enrich the existing Penny Black sample record.
  const pennyBlack = await tx.stamp.update({
    where: { id: "stamp-001" },
    data: {
      denomination: "1d",
      faceValue: 1,
      currencyId: currency.id,
      stampTypeId: stampType.id,
      perforationType: "IMPERFORATE",
    },
  });

  // Populate the default colour only when missing.
  // This preserves existing colour descriptions.
  await tx.stamp.updateMany({
    where: {
      id: pennyBlack.id,
      colour: null,
    },
    data: {
      colour: "Black",
    },
  });

  // Create a separate record for the 1864 Penny Red.
  const pennyRed = await tx.stamp.upsert({
    where: { id: "stamp-004" },
    update: {},
    create: {
      id: "stamp-004",
      name: "Penny Red — numbered plates",
      description:
        "The 1864 perforated rose-red plate-number issue.",
      year: 1864,
      countryId: country.id,
      denomination: "1d",
      faceValue: 1,
      currencyId: currency.id,
      stampTypeId: stampType.id,
      perforationType: "PERFORATED",
      perforationId: perforation.id,

      // Colour is now stored directly on the stamp.
      colour: "Rose Red",
    },
  });

  // Populate the default colour only when missing.
  await tx.stamp.updateMany({
    where: {
      id: pennyRed.id,
      colour: null,
    },
    data: {
      colour: "Rose Red",
    },
  });

  // Associate the Penny Black with Stanley Gibbons 2.
  await tx.catalogueReference.upsert({
    where: {
      stampId_catalogueId: {
        stampId: pennyBlack.id,
        catalogueId: catalogue.id,
      },
    },
    update: {},
    create: {
      stampId: pennyBlack.id,
      countryId: pennyBlack.countryId,
      catalogueId: catalogue.id,
      catalogueNumber: "2",
    },
  });

  // Associate the 1864 Penny Red with Stanley Gibbons 43.
  await tx.catalogueReference.upsert({
    where: {
      stampId_catalogueId: {
        stampId: pennyRed.id,
        catalogueId: catalogue.id,
      },
    },
    update: {},
    create: {
      stampId: pennyRed.id,
      countryId: pennyRed.countryId,
      catalogueId: catalogue.id,
      catalogueNumber: "43",
    },
  });
}