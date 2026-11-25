
/**
 * Standard response containing one resource.
 */
export type ApiSuccessResponse<T> = {
  data: T;
};

/**
 * Standard response containing multiple resources.
 */
export type ApiListResponse<T> = {
  data: T[];
  count: number;
};

/**
 * Standard response describing an API error.
 */
export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};
