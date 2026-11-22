import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import { stamps } from "../src/lib/stamp-data";

import {
  catalogues,
  countries,
  currencies,
  stampTypes,
  themes,
  variationTypes,
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
    // Reference records must exist before sample stamps.
    await seedReferenceData(tx);

    // Populate the sample stamp catalogue.
    await seedStamps(tx);
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