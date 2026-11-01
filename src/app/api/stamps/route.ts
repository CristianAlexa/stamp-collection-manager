import { stamps } from "@/lib/stamp-data";

/**
 * GET /api/stamps
 *
 * Returns all stamps, or filters by country.
 *
 * Examples:
 * /api/stamps
 * /api/stamps?country=France
 */

export function GET(request: Request) {
  // Read the request URL and query parameters.
  const url = new URL(request.url);
  const country = url.searchParams.get("country");

  // Return only matching stamps if filter exist.
  const filteredStamps = country
    ? stamps.filter(
        (stamps) =>
          stamps.country.toLowerCase() === country.trim().toLowerCase(),
      )
    : stamps;

  //Return JSON with HTTP status 200
  return Response.json(
    {
      data: filteredStamps,
      count: filteredStamps.length,
    },
    { status: 200 },
  );
}
