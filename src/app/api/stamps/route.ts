import { stamps } from "@/lib/stamp-data";

/**
 * GET /api/stamps
 *
 * Optional country filter:
 * /api/stamps?country=France
 */
export function GET(request: Request) {
  const url = new URL(request.url);

  // Normalise the input only once.
  const country = url.searchParams.get("country")?.trim().toLowerCase();

  // Apply the filter when a non-empty value exists.
  const filteredStamps = country
    ? stamps.filter((stamp) => stamp.country.toLowerCase() === country)
    : stamps;

  return Response.json({
    data: filteredStamps,
    count: filteredStamps.length,
  });
}
