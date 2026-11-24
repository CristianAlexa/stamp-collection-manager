import type { Prisma } from "../../src/generated/prisma/client";

// Supported international catalogue systems.
export const catalogues = [
  { code: "SG", name: "Stanley Gibbons" },
  { code: "SC", name: "Scott" },
  { code: "MI", name: "Michel" },
  { code: "YT", name: "Yvert & Tellier" },
] satisfies Prisma.CatalogueCreateInput[];

// Initial supported stamp-issuing countries.
export const countries = [
  { name: "Great Britain", code: "GB" },
  { name: "France", code: "FR" },
] satisfies Prisma.CountryCreateInput[];

// Predefined stamp classifications.
export const stampTypes = [
  "Definitive",
  "Commemorative",
  "Airmail",
  "Postage Due",
  "Official",
  "Revenue",
  "Express Delivery",
];

// Predefined thematic classifications.
export const themes = [
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

// Predefined dynamic variation characteristics.
export const variationTypes = [
  "Plate Number",
  "Paper Type",
  "Printing Error",
  "Printing Method",
  "Overprint",
  "Gum Type",
];

// Modern and historical currency definitions.
export const currencies = [
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "FRF", name: "French Franc", symbol: "F" },
  {
    code: "GBX-OLD",
    name: "Pre-decimal British Pence",
    symbol: "d",
  },
] satisfies Prisma.CurrencyCreateInput[];

// Reusable perforation measurements.
export const perforations = [
  {
    name: "14",
    horizontal: 14,
    vertical: 14,
  },
] satisfies Prisma.PerforationCreateInput[];