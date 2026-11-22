import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { stamps } from "../src/lib/stamp-data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const catalogues = [
  { code: "SG", name: "Stanley Gibbons" },
  { code: "SC", name: "Scott" },
  { code: "MI", name: "Michel" },
  { code: "YT", name: "Yvert & Tellier" },
];

const countryCodes: Record<string, string> = {
  "Great Britain": "GB",
  France: "FR",
};

// Predefined stamp classifications.
const stampTypes = [
  "Definitive",
  "Commemorative",
  "Airmail",
  "Postage Due",
  "Official",
  "Revenue",
  "Express Delivery",
];

// Predefined thematic classifications.
const themes = [
  "Animals",
  "Birds",
  "Nature",
  "History",
  "Royalty",
  "Transport",
  "Science",
  "Architecture",
  "Sports",
  "Art",
];

// Predefined dynamic variation types.
const variationTypes = [
  "Plate Number",
  "Paper Type",
  "Printing Error",
  "Printing Method",
  "Overprint",
  "Gum Type",
];

async function main() {
  await prisma.$transaction(async (tx) => {
    // Seed predefined stamp classifications.
for (const name of stampTypes) {
  await tx.stampType.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

// Seed predefined themes.
for (const name of themes) {
  await tx.theme.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

// Seed predefined variation types.
for (const name of variationTypes) {
  await tx.variationType.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}
    // Populate our supported catalogue systems.
    for (const catalogue of catalogues) {
      await tx.catalogue.upsert({
        where: {
          code: catalogue.code,
        },
        update: {},
        create: catalogue,
      });
    }

    // Populate countries and sample stamps.
    for (const stamp of stamps) {
      const countryCode = countryCodes[stamp.country];

      // Find or create the issuing country.
      const country = await tx.country.upsert({
        where: {
          name: stamp.country,
        },
        update: {},
        create: {
          name: stamp.country,
          ...(countryCode ? { code: countryCode } : {}),
        },
      });

      // Find or create the stamp.
      await tx.stamp.upsert({
        where: {
          id: stamp.id,
        },
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
  });

  console.log(
    `Seed completed for ${catalogues.length} catalogues and ${stamps.length} sample stamps.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Could not seed the stamp catalogue.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });