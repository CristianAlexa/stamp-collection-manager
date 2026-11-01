import type { Stamp } from "@/types/stamp";

/**
 * Temporary stamp catalogue data.
 * Later this will be replaced by PostgreSQL + Prisma.
 */
export const stamps: Stamp[] = [
  {
    id: "stamp-001",
    name: "Penny Black",
    country: "Great Britain",
    year: 1840,
    description: "The world's first adhesive postage stamp.",
  },
  {
    id: "stamp-002",
    name: "Penny Red",
    country: "Great Britain",
    year: 1841,
    description: "An early British definitive stamp.",
  },
  {
    id: "stamp-003",
    name: "Bordeaux Issue",
    country: "France",
    year: 1870,
    description: "A French issue from the Franco-Prussian War.",
  },
];
