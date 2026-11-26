
import {
  getCatalogueStampDetail,
  updateCatalogueStamp,
  deleteCatalogueStamp,
  CatalogueWriteError,
} from "@/lib/data/stamps";
import { stampIdSchema } from "@/lib/stamp-query-schema";
import {
  apiSuccess,
  apiError,
  apiNoContent,
} from "@/lib/api/responses";
import { Prisma } from "@/generated/prisma/client";
import { updateStampSchema } from "@/lib/stamp-mutation-schema";
import { catalogueMutationsAllowed } from "@/lib/api/mutation-guard";

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


/**
 * PATCH /api/stamps/:id
 *
 * Partially updates a shared catalogue stamp.
 */
export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (!catalogueMutationsAllowed()) {
    return apiError(
      "MUTATIONS_DISABLED",
      "Catalogue editing is currently disabled.",
      403,
    );
  }

  // Validate the internal stamp identifier.
  const { id } = await context.params;

  const idResult = stampIdSchema.safeParse(id);

  if (!idResult.success) {
    return apiError(
      "INVALID_STAMP_ID",
      "Enter a valid stamp identifier.",
      400,
    );
  }

  // Require a JSON request body.
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

  const result = updateStampSchema.safeParse(body);

  if (!result.success) {
    return apiError(
      "INVALID_STAMP_DATA",
      "The supplied stamp data is invalid.",
      400,
    );
  }

  try {
    const stamp = await updateCatalogueStamp(
      idResult.data,
      result.data,
    );

    return apiSuccess(stamp);
  } catch (error: unknown) {
    if (error instanceof CatalogueWriteError) {
      if (error.code === "STAMP_NOT_FOUND") {
        return apiError(
          error.code,
          error.message,
          404,
        );
      }

      if (
        error.code === "CATALOGUE_REFERENCE_IN_USE"
      ) {
        return apiError(
          error.code,
          error.message,
          409,
        );
      }

      return apiError(
        error.code,
        error.message,
        400,
      );
    }

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

      if (
        error.code === "P2003" ||
        error.code === "P2025"
      ) {
        return apiError(
          "RELATION_CONFLICT",
          "A related catalogue record has changed.",
          409,
        );
      }

      if (error.code === "P2034") {
        return apiError(
          "WRITE_CONFLICT",
          "A concurrent update occurred. Please retry.",
          409,
        );
      }
    }

    console.error(
      "Could not update the catalogue stamp.",
      error,
    );

    return apiError(
      "DATABASE_ERROR",
      "Could not update the stamp. Try again later.",
      500,
    );
  }
}

/**
 * DELETE /api/stamps/:id
 *
 * Safely deletes an unprotected catalogue stamp.
 */
export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  // Catalogue mutations remain development-only.
  if (!catalogueMutationsAllowed()) {
    return apiError(
      "MUTATIONS_DISABLED",
      "Catalogue editing is currently disabled.",
      403,
    );
  }

  // Validate the internal stamp identifier.
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
    await deleteCatalogueStamp(idResult.data);

    return apiNoContent();
  } catch (error: unknown) {
    // Expected business errors.
    if (error instanceof CatalogueWriteError) {
      return apiError(
        error.code,
        error.message,
        error.code === "STAMP_NOT_FOUND"
          ? 404
          : 409,
      );
    }

    // Database-level integrity protection.
    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      if (
        error.code === "P2003" ||
        error.code === "P2025"
      ) {
        return apiError(
          "RELATION_CONFLICT",
          "The catalogue record or its dependencies have changed.",
          409,
        );
      }

      if (error.code === "P2034") {
        return apiError(
          "WRITE_CONFLICT",
          "A concurrent operation occurred. Please retry.",
          409,
        );
      }
    }

    // Unexpected errors remain in server logs.
    console.error(
      "Could not delete the catalogue stamp.",
      error,
    );

    return apiError(
      "DATABASE_ERROR",
      "Could not delete the stamp. Try again later.",
      500,
    );
  }
}
