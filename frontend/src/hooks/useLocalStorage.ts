import { useCallback, useState } from 'react';
import { getStoredValue, setStoredValue, removeStoredValue } from '@/utils';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStored] = useState<T>(() => getStoredValue(key, initialValue));

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        setStoredValue(key, next);
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    removeStoredValue(key);
    setStored(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, remove] as const;
}
