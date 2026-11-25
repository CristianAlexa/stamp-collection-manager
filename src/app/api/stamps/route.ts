
import { filterStamps } from "@/lib/filter-stamps";
import { getCatalogueStamps } from "@/lib/data/stamps";
import { stampYearSchema } from "@/lib/stamp-query-schema";
import { apiList, apiError } from "@/lib/api/responses";

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
