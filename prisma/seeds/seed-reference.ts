import type { Prisma } from "../../src/generated/prisma/client";

import {
  catalogues,
  countries,
  currencies,
  stampTypes,
  themes,
  variationTypes,
  colours,
  perforations,
} from "./reference-data";

/**
 * Populates reusable reference data.
 *
 * Uses an existing transaction rather than creating
 * a separate Prisma Client connection.
 */
export async function seedReferenceData(
  tx: Prisma.TransactionClient,
): Promise<void> {
  // Seed issuing countries.
  for (const country of countries) {
    await tx.country.upsert({
      where: { name: country.name },
      update: {},
      create: country,
    });
    // Seed reusable stamp colours.
for (const colour of colours) {
  await tx.colour.upsert({
    where: { name: colour.name },
    update: {},
    create: colour,
  });
}

// Seed reusable perforation measurements.
for (const perforation of perforations) {
  await tx.perforation.upsert({
    where: { name: perforation.name },
    update: {},
    create: perforation,
  });
}
  }

  // Seed modern and historical currencies.
  for (const currency of currencies) {
    await tx.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
  }

  // Seed stamp classifications.
  for (const name of stampTypes) {
    await tx.stampType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed thematic classifications.
  for (const name of themes) {
    await tx.theme.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed dynamic variation types.
  for (const name of variationTypes) {
    await tx.variationType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed supported catalogue systems.
  for (const catalogue of catalogues) {
    await tx.catalogue.upsert({
      where: { code: catalogue.code },
      update: {},
      create: catalogue,
    });
  }
}