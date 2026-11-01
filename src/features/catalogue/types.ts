import type { Stamp } from "@/types/stamp";

/**
 * Describes the JSON structure returned
 * by GET /api/stamps.
 */

export interface StampsApiResponse {
  data: Stamp[];
  count: number;
}
