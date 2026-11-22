import type { Prisma } from "../../src/generated/prisma/client";

/**
 * Enriches the development stamp catalogue with
 * reusable reference data and relational information.
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

  const black = await tx.colour.findUniqueOrThrow({
    where: { name: "Black" },
  });

  const roseRed = await tx.colour.findUniqueOrThrow({
    where: { name: "Rose Red" },
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

  // Create a separate record for the 1864 Penny Red.
  const pennyRed = await tx.stamp.upsert({
    where: { id: "stamp-004" },
    update: {},
    create: {
      id: "stamp-004",
      name: "Penny Red — numbered plates",
      description: "The 1864 perforated rose-red plate-number issue.",
      year: 1864,
      countryId: country.id,
      denomination: "1d",
      faceValue: 1,
      currencyId: currency.id,
      stampTypeId: stampType.id,
      perforationType: "PERFORATED",
      perforationId: perforation.id,
    },
  });

  // Associate the Penny Black with its colour.
  await tx.stampColour.upsert({
    where: {
      stampId_colourId: {
        stampId: pennyBlack.id,
        colourId: black.id,
      },
    },
    update: {},
    create: {
      stampId: pennyBlack.id,
      colourId: black.id,
    },
  });

  // Associate the Penny Red with its colour.
  await tx.stampColour.upsert({
    where: {
      stampId_colourId: {
        stampId: pennyRed.id,
        colourId: roseRed.id,
      },
    },
    update: {},
    create: {
      stampId: pennyRed.id,
      colourId: roseRed.id,
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