export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export const successResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  success: true,
  data,
});

export const errorResponse = (
  code: string,
  message: string,
  details?: unknown,
): ApiErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    ...(details !== undefined ? { details } : {}),
  },
});
