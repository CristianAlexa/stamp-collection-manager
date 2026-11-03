import type { Stamp } from "@/types/stamp";

export interface StampFilters {
  query?: string;
  country?: string;
  year?: number;
}

export function filterStamps(
  stamps: readonly Stamp[],
  filters: StampFilters = {},
): Stamp[] {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const country = filters.country?.trim().toLowerCase() ?? "";
  const year = filters.year;

  return stamps.filter((stamp) => {
    const matchesQuery =
      query === "" || stamp.name.toLowerCase().includes(query);

    const matchesCountry =
      country === "" || stamp.country.toLowerCase() === country;

    const matchesYear = year === undefined || stamp.year === year;

    return matchesQuery && matchesCountry && matchesYear;
  });
}
