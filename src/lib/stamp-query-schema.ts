import { z } from "zod";

export const stampYearSchema = z
  .string()
  .regex(/^[1-9]\d{3}$/, "Year must be a four-digit number.")
  .transform((value) => Number(value))
  .optional();
