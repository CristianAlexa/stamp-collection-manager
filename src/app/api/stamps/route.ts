
import { filterStamps } from "@/lib/filter-stamps";
import {
  getCatalogueStamps,
  createCatalogueStamp,
  CatalogueWriteError,
} from "@/lib/data/stamps";
import { stampYearSchema } from "@/lib/stamp-query-schema";
import {
  apiList,
  apiError,
  apiSuccess,
} from "@/lib/api/responses";
import { Prisma } from "@/generated/prisma/client";
import { createStampSchema } from "@/lib/stamp-mutation-schema";
import { catalogueMutationsAllowed } from "@/lib/api/mutation-guard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const query = url.searchParams.get("query") ?? "";
  const country = url.searchParams.get("country") ?? "";
  const rawYear = url.searchParams.get("year")?.trim();

  // Validate the optional year filter.
  const yearResult = stampYearSchema.safeParse(
    rawYear || undefined,
  );

  if (!yearResult.success) {
    return apiError(
      "INVALIDID_YEAR",
      "Enter a valid stamp year",
      400,
    );
  }

  try {
    // Retrieve catalogue records through the DAL.
    const stamps = await getCatalogueStamps();

    // Apply existing catalogue filters.
    const filteredStamps = filterStamps(stamps, {
      query,
      country,
      year: yearResult.data,
    });

    return apiList(filteredStamps);
  } catch (error: unknown) {
    // Detailed database errors remain on the server.
    console.error(
      "Could not load stamps from PostgreSQL.",
      error,
    );

    return apiError(
      "DATABASE_ERROR",
      "Could not load the stamp catalogue. Try again later.",
      500,
    );
  }
}


/**
 * POST /api/stamps
 *
 * Creates a shared catalogue stamp.
 */
export async function POST(
  request: Request,
): Promise<Response> {
  // Temporary development-only mutation guard.
  if (!catalogueMutationsAllowed()) {
    return apiError(
      "MUTATIONS_DISABLED",
      "Catalogue editing is currently disabled.",
      403,
    );
  }

  // Only accept JSON request bodies.
  const contentType = request.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    return apiError(
      "INVALID_CONTENT_TYPE",
      "Send the request as application/json.",
      400,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError(
      "INVALID_JSON",
      "The request body must contain valid JSON.",
      400,
    );
  }

  // Validate incoming data before writing.
  const result = createStampSchema.safeParse(body);

  if (!result.success) {
    return apiError(
      "INVALID_STAMP_DATA",
      "The supplied stamp data is invalid.",
      400,
    );
  }

  try {
    const stamp = await createCatalogueStamp(
      result.data,
    );

    const response = apiSuccess(stamp, 201);

    response.headers.set(
      "Location",
      `/api/stamps/${encodeURIComponent(stamp.id)}`,
    );

    return response;
  } catch (error: unknown) {
    // Expected business validation errors.
    if (error instanceof CatalogueWriteError) {
      return apiError(
        error.code,
        error.message,
        400,
      );
    }

    // Known Prisma database errors.
    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2002") {
        return apiError(
          "DUPLICATE_CATALOGUE_REFERENCE",
          "A catalogue record or reference already exists.",
          409,
        );
      }

      if (error.code === "P2003") {
        return apiError(
          "RELATION_CONFLICT",
          "A related catalogue record has changed.",
          409,
        );
      }
    }

    // Unexpected database errors remain private.
    console.error(
      "Could not create the catalogue stamp.",
      error,
    );

    return apiError(
      "DATABASE_ERROR",
      "Could not create the stamp. Try again later.",
      500,
    );
  }
}
