import type { AxiosError } from 'axios';
import type { ErrorResponse, ValidationError } from '@/types';

export interface NormalizedError {
  message: string;
  fieldErrors: Record<string, string>;
  status: number | null;
  requestId?: string;
}

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

/** Extract a human-friendly message from any thrown value. */
export const getErrorMessage = (error: unknown): string => {
  if (!error) return DEFAULT_MESSAGE;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message || DEFAULT_MESSAGE;

  const axiosError = error as AxiosError<ErrorResponse>;
  if (axiosError.isAxiosError) {
    const data = axiosError.response?.data;
    if (data?.message) return data.message;
    if (axiosError.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!axiosError.response) return 'Network error. Check your connection and try again.';
    if (axiosError.response.status === 401) return 'Your session has expired. Please sign in again.';
    if (axiosError.response.status === 403) return 'You do not have permission to perform this action.';
    if (axiosError.response.status === 404) return 'The requested resource was not found.';
    if (axiosError.response.status >= 500) return 'The server encountered an error. Please try again later.';
  }
  return DEFAULT_MESSAGE;
};

/** Map API validation errors into a `{ field: message }` record for forms. */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  const axiosError = error as AxiosError<ErrorResponse>;
  const errors = axiosError.isAxiosError ? (axiosError.response?.data?.errors as ValidationError[] | undefined) : undefined;
  if (!errors || errors.length === 0) return {};
  return errors.reduce<Record<string, string>>((acc, err) => {
    acc[err.field] = err.message;
    return acc;
  }, {});
};

export const normalizeError = (error: unknown): NormalizedError => {
  const axiosError = error as AxiosError<ErrorResponse>;
  return {
    message: getErrorMessage(error),
    fieldErrors: getFieldErrors(error),
    status: axiosError.isAxiosError ? (axiosError.response?.status ?? null) : null,
    requestId: axiosError.isAxiosError ? axiosError.response?.data?.requestId : undefined,
  };
};

export const isUnauthorizedError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return axiosError.isAxiosError && axiosError.response?.status === 401;
};
