
import { getCatalogueStampDetail } from "@/lib/data/stamps";
import { stampIdSchema } from "@/lib/stamp-query-schema";
import { apiSuccess, apiError } from "@/lib/api/responses";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/stamps/:id
 *
 * Returns detailed information about one
 * shared catalogue stamp.
 */
export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;

  const idResult = stampIdSchema.safeParse(id);

  if (!idResult.success) {
    return apiError(
      "INVALID_STAMP_ID",
      "Enter a valid stamp identifier.",
      400,
    );
  }

  try {
    const stamp = await getCatalogueStampDetail(
      idResult.data,
    );

    if (!stamp) {
      return apiError(
        "STAMP_NOT_FOUND",
        "The requested stamp does not exist.",
        404,
      );
    }

    return apiSuccess(stamp);
  } catch (error: unknown) {
    console.error(
      "Could not load the catalogue stamp.",
      error,
    );

    return apiError(
      "DATABASE_ERROR",
      "Could not load the stamp. Try again later.",
      500,
    );
  }
}
