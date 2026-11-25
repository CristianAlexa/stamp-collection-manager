/**
 * Returns the effective catalogue colour for a stamp
 * or one of its variants.
 *
 * A variant's colour takes priority.
 * When no override exists, inherit the parent colour.
 */
export function getEffectiveStampColour(
  stampColour: string | null | undefined,
  variantColour?: string | null,
): string | null {
  // Treat whitespace-only values as missing information.
  const parent = stampColour?.trim();
  const variant = variantColour?.trim();

  return variant || parent || null;
}