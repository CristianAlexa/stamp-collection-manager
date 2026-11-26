
import { z } from "zod";
import { stampIdSchema } from "./stamp-query-schema";

/**
 * Reference to an existing international catalogue.
 */
const catalogueReferenceSchema = z
  .object({
    catalogueCode: z
      .string()
      .trim()
      .min(1)
      .max(20)
      .toUpperCase(),

    catalogueNumber: z
      .string()
      .trim()
      .min(1)
      .max(100),
  })
  .strict();

/**
 * Validates the creation of a shared catalogue stamp.
 */
export const createStampSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .nullable()
      .optional(),

    description: z
      .string()
      .trim()
      .max(2000)
      .nullable()
      .optional(),

    countryId: stampIdSchema,

    year: z
      .number()
      .int()
      .min(1000)
      .max(9999),

    faceValue: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .nullable()
      .optional(),

    colour: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .nullable()
      .optional(),

    catalogueReferences: z
      .array(catalogueReferenceSchema)
      .max(20)
      .default([]),
  })
  .strict()
  .superRefine((data, context) => {
    const codes = new Set<string>();

    data.catalogueReferences.forEach(
      (reference, index) => {
        if (codes.has(reference.catalogueCode)) {
          context.addIssue({
            code: "custom",
            path: [
              "catalogueReferences",
              index,
              "catalogueCode",
            ],
            message:
              "Only one reference per catalogue is allowed.",
          });
        }

        codes.add(reference.catalogueCode);
      },
    );
  });

/**
 * TypeScript type inferred from the validation schema.
 */
export type CreateStampInput = z.infer<
  typeof createStampSchema
>;
