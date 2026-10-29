/**
 * Represents the basic information about a stamp
 * in our shared catalogue.
 *
 * We will extend this model when we introduce
 * PostgreSQL and Prisma.
 */
export interface Stamp {
  id: string;
  name: string;
  country: string;
  year: number;

  // Optional descriptive information
  description?: string;
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
