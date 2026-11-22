import { filterStamps } from "@/lib/filter-stamps";
import { prisma } from "@/lib/prisma";
import { stampYearSchema } from "@/lib/stamp-query-schema";
import type { ApiErrorResponse, ApiListResponse } from "@/types/api";
import type { Stamp } from "@/types/stamp";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const query = url.searchParams.get("query") ?? "";
  const country = url.searchParams.get("country") ?? "";
  const rawYear = url.searchParams.get("year")?.trim();

  const yearResult = stampYearSchema.safeParse(rawYear || undefined);

  if (!yearResult.success) {
    const response: ApiErrorResponse = {
      error: {
        code: "INVALIDID_YEAR",
        message: "Enter a valid stamp year",
      },
    };

    return Response.json(response, { status: 400 });
  }

  try {
const records = await prisma.stamp.findMany({
  select: {
    id: true,
    name: true,
    country: {
      select: {
        name: true,
        code: true,
      },
    },
    catalogueReferences: {
      select: {
        catalogueNumber: true,
        catalogue: {
          select: {
            code: true,
          },
        },
      },
      orderBy: {
        catalogue: {
          code: "asc",
        },
      },
    },
    year: true,
    description: true,
  },
  orderBy: [
    { year: "asc" },
    { id: "asc" },
  ],
});

    // PostgreSQL permits NULL, while our API type uses an optional string.
const stamps: Stamp[] = records.map((record) => {
  // Build human-readable catalogue references.
  const references = record.catalogueReferences.map(
    (reference) =>
      `${reference.catalogue.code}-${record.country.code ?? record.country.name}-${reference.catalogueNumber}`,
  );

  // Prefer Stanley Gibbons for unnamed stamps.
  const preferredReference =
    references.find((reference) =>
      reference.startsWith("SG-"),
    ) ?? references[0];

  return {
    id: record.id,
    name:
      record.name ??
      preferredReference ??
      "Unidentified stamp",
    country: record.country.name,
    year: record.year,
    catalogueReferences: references,
    ...(record.description === null
      ? {}
      : { description: record.description }),
  };
});

    const filteredStamps = filterStamps(stamps, {
      query,
      country,
      year: yearResult.data,
    });

    const response: ApiListResponse<Stamp> = {
      data: filteredStamps,
      count: filteredStamps.length,
    };

    return Response.json(response);
  } catch (error: unknown) {
    // Detailed errors stay in the server terminal.
    console.error("Could not load stamps from PostgreSQL.", error);

    const response: ApiErrorResponse = {
      error: {
        code: "DATABASE_ERROR",
        message: "Could not load the stamp catalogue. Try again later.",
      },
    };

    return Response.json(response, { status: 500 });
  }
}