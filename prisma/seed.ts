import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { stamps } from "../src/lib/stamp-data";
import { seedCatalogue } from "./seeds/seed-catalogue";
import { seedVariants } from "./seeds/seed-variants";
import { seedCollections } from "./seeds/seed-collections";

import {
  catalogues,
  countries,
  currencies,
  stampTypes,
  themes,
  variationTypes,
  colours,
  perforations,
} from "./seeds/reference-data";

import { seedReferenceData } from "./seeds/seed-reference";
import { seedStamps } from "./seeds/seed-stamps";

// Validate the database connection string.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing.");
}

// Initialise Prisma with the PostgreSQL adapter.
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Main database seed entry point.
 *
 * Coordinates all seed modules inside one transaction.
 */
async function main(): Promise<void> {
  console.log("Starting database seed...");

  await prisma.$transaction(async (tx) => {
  // 1. Populate reusable reference data.
  await seedReferenceData(tx);

  // 2. Populate the original sample stamps.
  await seedStamps(tx);

  // 3. Enrich the relational catalogue.
  await seedCatalogue(tx);

  // 4. Create identifiable stamp variations.
  await seedVariants(tx);

  // 5. Populate personal stamp collections.
  await seedCollections(tx);
});

  // Display a summary only after a successful transaction.
  console.log("Database seed completed successfully.");
  console.log("Seed definitions processed:");

  console.table({
    Countries: countries.length,
    Catalogues: catalogues.length,
    Currencies: currencies.length,
    "Stamp types": stampTypes.length,
    Themes: themes.length,
    "Variation types": variationTypes.length,
    "Sample stamps": stamps.length,
    Colours: colours.length,
Perforations: perforations.length,
"Additional catalogue stamps": 1,
"Catalogue references": 2,
"Stamp variants": 2,
"Development collectors": 2,
"Personal albums": 3,
"Collection items": 7,
  });
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });