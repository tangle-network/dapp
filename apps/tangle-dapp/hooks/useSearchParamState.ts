import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import useSearchParamsZustandStore from '../context/useSearchParamsStore';

export type SearchParamStateOptions<T> = {
  key: string;
  defaultValue: T;
  parser: (value: string) => T | undefined;
  stringify: (value: T) => string | undefined;
};

const useSearchParamState = <T>({
  key,
  defaultValue,
  parser: parse,
  stringify,
}: SearchParamStateOptions<T>): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(defaultValue);
  const searchParams = useSearchParamsZustandStore();
  const hasLoadedValueRef = useRef(false);
  const router = useRouter();

  // Load the value from the URL search params on mount.
  useEffect(() => {
    // Only load the value once.
    if (hasLoadedValueRef.current) {
      return;
    }

    const paramValue = searchParams.get(key);

    if (paramValue === null) {
      return;
    }

    let parsedValue: T;

    // Attempt to parse the value. If it fails, ignore it.
    try {
      const parseResult = parse(paramValue);

      // Return value signals that parsing failed. Ignore the value.
      if (parseResult === undefined) {
        return;
      }

      parsedValue = parseResult;
    } catch {
      return;
    }

    hasLoadedValueRef.current = true;
    setValue(parsedValue);
  }, [key, parse, searchParams]);

  // Sync the value with the URL search params when it changes.
  useEffect(() => {
    const stringifiedValue = stringify(value);

    // TODO: Try re-creating the URL using the search params from `useSearchParamsStore` instead of `window.location.href`. That may be more reliable.
    const newUrl = new URL(window.location.href);

    if (stringifiedValue === undefined) {
      newUrl.searchParams.delete(key);
    } else {
      newUrl.searchParams.set(key, stringifiedValue);
    }

    const newUrlString = newUrl.toString();

    // Prevent pushing the same URL to the history.
    if (window.location.href === newUrlString) {
      return;
    }

    router.push(newUrlString);
  }, [key, router, stringify, value]);

  return [value, setValue] as const;
};

export default useSearchParamState;
