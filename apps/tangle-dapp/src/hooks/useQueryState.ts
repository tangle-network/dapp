'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';

function useQueryState(key: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [value, setValue] = useState(() => {
    return searchParams.get(key) || null;
  });

  useEffect(() => {
    const currentValue = searchParams.get(key);
    if (currentValue !== value) {
      setValue(currentValue || null);
    }
  }, [searchParams, key, value]);

  const updateValue = useCallback(
    (newValue: string | null) => {
      setValue(newValue);

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
