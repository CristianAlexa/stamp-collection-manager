import { z } from "zod";

export const stampYearSchema = z
  .string()
  .regex(/^[1-9]\d{3}$/, "Year must be a four-digit number.")
  .transform((value) => Number(value))
  .optional();


/**
 * Validates catalogue stamp identifiers.
 *
 * Supports Prisma-generated identifiers and
 * existing development seed identifiers.
 */
export const stampIdSchema = z
  .string()
  .min(1, "Stamp ID is required.")
  .max(128, "Stamp ID is too long.")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Stamp ID contains invalid characters.",
  );
