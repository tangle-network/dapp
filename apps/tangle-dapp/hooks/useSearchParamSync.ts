import { ReadonlyURLSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import useSearchParamsStore from '../context/useSearchParamsStore';

export type UseSearchParamSyncOptions<T> = {
  key: string;
  value: T;
  parse: (value: string) => T | undefined;
  stringify: (value: T) => string | undefined;
  setValue: (value: T) => unknown;
};

const createHref = (newSearchParams: ReadonlyURLSearchParams): string => {
  const newUrl = new URL(window.location.href);

  for (const [key] of newUrl.searchParams) {
    newUrl.searchParams.delete(key);
  }

  for (const [key, value] of newSearchParams) {
    newUrl.searchParams.set(key, value);
  }

  return newUrl.toString();
};

const useSearchParamSync = <T>({
  key,
  value,
  parse,
  stringify,
  setValue,
}: UseSearchParamSyncOptions<T>) => {
  const { searchParams, updateSearchParam } = useSearchParamsStore();
  const hasLoadedValueRef = useRef(false);
  const router = useRouter();

  const initializeValue = useCallback(() => {
    hasLoadedValueRef.current = true;
    setValue(value);

    console.debug(
      'Initialized URL search param with initial value',
      key,
      value,
    );
  }, [key, setValue, value]);

  // Load the value from the URL search params on mount.
  useEffect(() => {
    // Only load the value once. Also, ensure that the search
    // params are ready.
    if (hasLoadedValueRef.current || searchParams === null) {
      return;
    }

    const paramValue = searchParams.get(key);

    // No key present in the URL search params.
    if (paramValue === null) {
      initializeValue();

      return;
    }

    let parsedValue: T;

    // Attempt to parse the value. If it fails, ignore it.
    try {
      const parseResult = parse(paramValue);

      // Return value signals that parsing failed. Ignore the value.
      if (parseResult === undefined) {
        initializeValue();
        console.warn('URL search param parsing returned undefined', key);

        return;
      }

      parsedValue = parseResult;
    } catch (error) {
      console.warn('Error thrown while parsing URL search param', key, error);
      initializeValue();

      return;
    }

    console.debug('Loaded URL search param', key, parsedValue);
    hasLoadedValueRef.current = true;
    setValue(parsedValue);
  }, [initializeValue, key, parse, searchParams, setValue]);

  // TODO: Data race is still occurring, but it is currently prioritizing the correct final value. Need to ensure that only one run of the effect occurs at a time.
  // Sync the value to the URL search param when it changes.
  useEffect(() => {
    // Wait until the initial value has been loaded before syncing.
    // Also, ensure that the search params are ready.
    if (!hasLoadedValueRef.current || searchParams === null) {
      return;
    }

    const stringifiedValue = stringify(value);
    const existingParam = searchParams.get(key);

    // Nothing to do.
    if (existingParam === null && stringifiedValue === undefined) {
      return;
    }
    // If the value is already the same in the URL search params,
    // do nothing.
    else if (existingParam === stringifiedValue) {
      return;
    }

    const newSearchParams = updateSearchParam(key, stringifiedValue);
    const href = createHref(new ReadonlyURLSearchParams(newSearchParams));

    console.debug('Syncing URL search param', key, stringifiedValue, href);
    router.push(href);
  }, [key, router, searchParams, stringify, updateSearchParam, value]);
};

export default useSearchParamSync;
