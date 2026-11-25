/**
 * Represents a stamp returned by our shared catalogue.
 *
 * This application-facing interface is independent of
 * the underlying Prisma database model.
 */
export interface Stamp {
  id: string;
  name: string;
  country: string;
  year: number;

  // Optional catalogue information.
  description?: string;
  catalogueReferences?: string[];

  // Optional issuing country metadata.
  countryFlagUrl?: string | null;
  countryDescription?: string | null;

  // Printed denomination and catalogue colour.
  faceValue?: string | null;
  colour?: string | null;
}

/**
 * Creates a readable label for a stamp.
 *
 * Example:
 * "Penny Black (Great Britain, 1840)"
 */
export function getStampLabel(stamp: Stamp): string {
  return `${stamp.name} (${stamp.country}, ${stamp.year})`;
}