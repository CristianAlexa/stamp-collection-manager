import "dotenv/config";

import {PrismaPg } from "@prisma/adapter-pg";
import {PrismaClient} from "../src/generated/prisma/client";
import { stamps} from "../src/lib/stamp-data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check your .env file.");
}

// The adapter connects Prisma Client to PostgreSQL.
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    //A pply all stamps records in one transaction.
    await prisma.$transaction(
        stamps.map((stamp) =>
            prisma.stamp.upsert({
                where: { id: stamp.id },
                update: {},
                create: {
                    id: stamp.id,
                    name: stamp.name,
                    country: stamp.country,
                    year: stamp.year,
                    description: stamp.description,
                },

            }),
        ),
    );

    console.log(`Seed completed for ${stamps.length} sample stamps.`);
}

main().catch((error: unknown )=> {
    console.error("Could not seed the stamp catalogue",error);
    process.exitCode = 1;})
    .finally(async () => {
        await prisma.$disconnect();
    });


