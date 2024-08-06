'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

const useTypedSearchParams = <T extends object>(parsers: {
  [Key in keyof T]: (value: string) => T[Key] | undefined;
}) => {
  const router = useRouter();
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

  const setSearchParam = useCallback(
    (key: keyof T & string, value: string) => {
      const url = new URL(window.location.href);

      url.searchParams.set(key, value);
      router.push(url.toString());
    },
    [router],
  );

  const typedSearchParams = useMemo<Partial<T>>(() => {
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

  return { searchParams: typedSearchParams, setSearchParam };
};

export default useTypedSearchParams;
