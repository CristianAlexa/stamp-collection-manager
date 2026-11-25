import type { ApiSuccessResponse, ApiListResponse, ApiErrorResponse } from "@/types/api";

/**
 * Returns a successful response containing
 * a single resource.
 */

export function apiSuccess<T>(data: T, status: 200 | 201 = 200): Response {
    const response: ApiSuccessResponse<T> = { data };

    return Response.json(response, { status });
}

/**
 * Returns a successful response containing
 * a list of resources.
 */
export function apiList<T>(data: T[]): Response {
  const response: ApiListResponse<T> = {
    data,
    count: data.length,
  };

  return Response.json(response, {
    status: 200,
  });
}

/**
 * Returns a standardised API error response.
 */

export function apiError(
    code: string,
    message: string,
    status: 400 | 401 | 403 | 404 | 500 ,
): Response {
    const response: ApiErrorResponse = { error: { code, message } };

    return Response.json(response, { status });
}

/**
 * Returns a successful response without a body.
 */

export function apiNoContent(): Response {
    return new Response(null, { status: 204 });
}