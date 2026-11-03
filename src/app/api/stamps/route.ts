import { filterStamps } from "@/lib/filter-stamps";
import { stamps } from "@/lib/stamp-data";

export function GET(request: Request) {
  const url = new URL(request.url);

  const query = url.searchParams.get("query") ?? "";
  const country = url.searchParams.get("country") ?? "";
  const yearText = url.searchParams.get("year")?.trim() ?? "";

  let year: number | undefined;

  if (yearText !== "") {
    const parsedYear = Number(yearText);

    if (!Number.isInteger(parsedYear) || parsedYear < 1) {
      return Response.json(
        { error: "Year must be a positive whole number." },
        { status: 400 },
      );
    }

    year = parsedYear;
  }

  const filteredStamps = filterStamps(stamps, {
    query,
    country,
    year,
  });

  return Response.json({
    data: filteredStamps,
    count: filteredStamps.length,
  });
}
