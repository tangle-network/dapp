import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

function useQueryState(key: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(
    () => searchParams.get(key) || null,
    [searchParams, key],
  );

  const updateValue = useCallback(
    (newValue: string | null) => {
      setSearchParams((prev) => {
        const newSearchParams = new URLSearchParams(prev.toString());

        if (newValue) {
          newSearchParams.set(key, newValue);
        } else {
          newSearchParams.delete(key);
        }

        return newSearchParams;
      });
    },
    [key, setSearchParams],
  );

  return [value, updateValue] as const;
}

export default useQueryState;
