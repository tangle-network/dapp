'use client';

import { useSearchParams } from 'next/navigation';

const useTypedSearchParams = <T extends object>(parsers: {
  [Key in keyof T]: (value: string) => T[Key] | undefined;
}): Partial<T> => {
  const searchParams = useSearchParams();

  const entries = Object.keys(parsers).map((stringKey) => {
    // TODO: Find a way to avoid casting here.
    const key = stringKey as keyof T;
    const parser = parsers[key];
    const paramValue = searchParams.get(stringKey);
    const parsedValue = paramValue !== null ? parser(paramValue) : undefined;

    return [stringKey, parsedValue] as const;
  });

  const result: Partial<T> = {};

  for (const [stringKey, value] of entries) {
    // TODO: Find a way to avoid casting here.
    const key = stringKey as keyof T;

    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
};

export default useTypedSearchParams;
