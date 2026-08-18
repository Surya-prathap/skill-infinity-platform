import { useCallback, useState } from 'react';
import { getErrorMessage, getFieldErrors } from '@/utils';

export interface UseApiResult<TData, TArgs extends unknown[] = unknown[]> {
  data: TData | null;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  execute: (...args: TArgs) => Promise<TData | null>;
  reset: () => void;
}

/**
 * Generic hook for executing an API request function with built-in
 * loading / error / field-error state management.
 */
export function useApi<TData, TArgs extends unknown[] = unknown[]>(
  requestFn: (...args: TArgs) => Promise<{ data: { data: TData } }>,
): UseApiResult<TData, TArgs> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const execute = useCallback(
    async (...args: TArgs): Promise<TData | null> => {
      setLoading(true);
      setError(null);
      setFieldErrors({});
      try {
        const response = await requestFn(...args);
        const payload = response.data?.data;
        setData(payload);
        return payload;
      } catch (err) {
        setError(getErrorMessage(err));
        setFieldErrors(getFieldErrors(err));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [requestFn],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setFieldErrors({});
  }, []);

  return { data, loading, error, fieldErrors, execute, reset };
}
