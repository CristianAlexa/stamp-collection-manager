
/**
 * Application-facing catalogue reference.
 */
export interface StampCatalogueReference {
  catalogueCode: string;
  catalogueName: string;
  catalogueNumber: string;
  reference: string;
}

/**
 * Issuing country information.
 */
export interface StampDetailCountry {
  id: string;
  name: string;
  code: string | null;
  flagUrl: string | null;
  description: string | null;
}

/**
 * Application-facing catalogue variation.
 */
export interface StampVariantDetail {
  id: string;
  name: string | null;
  description: string | null;

  // Explicit override.
  colour: string | null;

  // Override or inherited parent colour.
  effectiveColour: string | null;

  attributes: {
    type: string;
    value: string;
  }[];
}

/**
 * Detailed catalogue stamp returned by
 * GET /api/stamps/:id.
 */
export interface StampDetail {
  id: string;
  name: string;
  description: string | null;

  year: number;
  issueMonth: number | null;
  issueDay: number | null;

  country: StampDetailCountry;

  faceValue: string | null;
  colour: string | null;

  widthMm: string | null;
  heightMm: string | null;

  stampType: {
    id: string;
    name: string;
  } | null;

  watermarkStatus: "NONE" | "PRESENT" | "UNKNOWN";
  watermarkOrientation: string | null;

  watermark: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  } | null;

  perforationType:
    | "PERFORATED"
    | "IMPERFORATE"
    | "PARTIALLY_PERFORATED"
    | "UNKNOWN";

  perforation: {
    id: string;
    name: string;
    horizontal: string | null;
    vertical: string | null;
  } | null;

  catalogueReferences: StampCatalogueReference[];
  variants: StampVariantDetail[];
}
