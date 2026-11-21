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

async function main() {
  // Seed the catalogue inside one transaction.
  await prisma.$transaction(async (tx) => {
    for (const stamp of stamps) {
      // Create the country only if it does not exist.
      const country = await tx.country.upsert({
        where: {
          name: stamp.country,
        },
        update: {},
        create: {
          name: stamp.country,
        },
      });

      // Create the stamp and connect it to its country.
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

  console.log(`Seed completed for ${stamps.length} sample stamps.`);
}

main()
  .catch((error: unknown) => {
    console.error("Could not seed the stamp catalogue.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });