
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
 * Shared catalogue reference validation.
 */
const catalogueReferencesSchema = z
  .array(catalogueReferenceSchema)
  .max(20)
  .superRefine((references, context) => {
    const codes = new Set<string>();

    references.forEach((reference, index) => {
      if (codes.has(reference.catalogueCode)) {
        context.addIssue({
          code: "custom",
          path: [index, "catalogueCode"],
          message:
            "Only one reference per catalogue is allowed.",
        });
      }

      codes.add(reference.catalogueCode);
    });
  });

/**
 * Fields shared by creation and update operations.
 */
const editableStampFields = {
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
};

/**
 * Validates the creation of a catalogue stamp.
 */
export const createStampSchema = z
  .object({
    ...editableStampFields,

    countryId: stampIdSchema,

    catalogueReferences:
      catalogueReferencesSchema.default([]),
  })
  .strict();

/**
 * Validates partial catalogue stamp updates.
 */
export const updateStampSchema = z
  .object({
    ...editableStampFields,

    catalogueReferences:
      catalogueReferencesSchema.refine(
        (references) => references.length > 0,
        "Provide at least one catalogue reference.",
      ),
  })
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update.",
  );

export type CreateStampInput = z.infer<
  typeof createStampSchema
>;

export type UpdateStampInput = z.infer<
  typeof updateStampSchema
>;
