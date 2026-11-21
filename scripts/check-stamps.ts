// Load DATABASE_URL from the project's .env file.
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check your .env file.");
}

// The adapter connects Prisma Client to PostgreSQL.
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const stamps = await prisma.stamp.findMany({
    select: {
      id: true,
      name: true,
      country: true,
      year: true,
    },
    orderBy: [
      { year: "asc" },
      { id: "asc" },
    ],
  });

  console.log(`Found ${stamps.length} stamp records.`);
  console.table(stamps);
}

main()
  .catch((error: unknown) => {
    console.error("Could not read the stamp catalogue.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Release database connections when this script finishes.
    await prisma.$disconnect();
  });