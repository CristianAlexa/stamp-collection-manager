import { filterStamps } from "@/lib/filter-stamps";
import { stamps } from "@/lib/stamp-data";
import type { ApiListResponse } from "@/types/api";
import type { Stamp } from "@/types/stamp";
import { stampYearSchema } from "@/lib/stamp-query-schema";

export function GET(request: Request) {
  const url = new URL(request.url);

  const query = url.searchParams.get("query") ?? "";
  const country = url.searchParams.get("country") ?? "";
  const rawYear = url.searchParams.get("year")?.trim();

  const yearResult = stampYearSchema.safeParse(rawYear || undefined);

  if (!yearResult.success) {
    return Response.json(
      { error: "Year must be a four-digit number." },
      { status: 400 },
    );
  }

  const year = yearResult.data;

  const filteredStamps = filterStamps(stamps, {
    query,
    country,
    year,
  });

  const response: ApiListResponse<Stamp> = {
    data: filteredStamps,
    count: filteredStamps.length,
  };

  return Response.json(response);
}
