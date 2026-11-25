import type { Stamp } from "@/types/stamp";

/**
 * Static catalogue fixtures used by application tests.
 *
 * The live catalogue retrieves its data from PostgreSQL.
 */
export const stamps: Stamp[] = [
  {
    id: "stamp-001",
    name: "Penny Black",
    country: "Great Britain",
    year: 1840,
    description:
      "The world's first adhesive postage stamp.",
    faceValue: "1d",
    colour: "Black",
    countryFlagUrl: null,
    countryDescription: null,
  },
  {
    id: "stamp-002",
    name: "Penny Red",
    country: "Great Britain",
    year: 1841,
    description:
      "An early British definitive stamp.",
    faceValue: null,
    colour: null,
    countryFlagUrl: null,
    countryDescription: null,
  },
  {
    id: "stamp-003",
    name: "Bordeaux Issue",
    country: "France",
    year: 1870,
    description:
      "A French issue from the Franco-Prussian War.",
    faceValue: null,
    colour: null,
    countryFlagUrl: null,
    countryDescription: null,
  },
];