import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { apiClient } from '../api';
import { ApiResponse, ErrorResponse } from '../types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  requestFn: (...args: any[]) => Promise<{ data: ApiResponse<T> }>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await requestFn(...args);
        const apiResponse = response.data;
        setState({ data: apiResponse.data, loading: false, error: null });
        return apiResponse.data;
      } catch (err) {
        const axiosError = err as AxiosError<ErrorResponse>;
        const message =
          axiosError.response?.data?.message || 'An unexpected error occurred';
        setState({ data: null, loading: false, error: message });
        return null;
      }
    },
    [requestFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
