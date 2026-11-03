export type ApiListResponse<T> = {
  data: T[];
  count: number;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};
