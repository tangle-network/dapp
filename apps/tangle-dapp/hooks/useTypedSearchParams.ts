'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

const useTypedSearchParams = <T extends object>(parsers: {
  [Key in keyof T]: (value: string) => T[Key] | undefined;
}): Partial<T> => {
  const searchParams = useSearchParams();

  const entries = useMemo(() => {
    return Object.keys(parsers).map((stringKey) => {
      // TODO: Find a way to avoid casting here.
      const key = stringKey as keyof T;
      const parser = parsers[key];
      const paramValue = searchParams.get(stringKey);
      let parsedValue: T[keyof T] | undefined;

      // Try parsing the value. If it fails, ignore the value.
      try {
        parsedValue = paramValue !== null ? parser(paramValue) : undefined;
      } catch {
        parsedValue = undefined;
      }

      return [stringKey, parsedValue] as const;
    });
  }, [parsers, searchParams]);

  return useMemo(() => {
    const result: Partial<T> = {};

    for (const [stringKey, value] of entries) {
      // TODO: Find a way to avoid casting here.
      const key = stringKey as keyof T;

      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }, [entries]);
};

export default useTypedSearchParams;
