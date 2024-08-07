import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import useSearchParamsStore from '../context/useSearchParamsStore';

export type UseSearchParamSyncOptions<T> = {
  key: string;
  value: T;
  parse: (value: string) => T | undefined;
  stringify: (value: T) => string | undefined;
  setValue: (value: T) => unknown;
};

const useSearchParamSync = <T>({
  key,
  value,
  parse,
  stringify,
  setValue,
}: UseSearchParamSyncOptions<T>) => {
  const { searchParams, href, setHref } = useSearchParamsStore();
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
      hasLoadedValueRef.current = true;

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
      hasLoadedValueRef.current = true;

      return;
    }

    console.debug('Loaded URL search param', key, parsedValue);
    hasLoadedValueRef.current = true;
    setValue(parsedValue);
  }, [key, parse, searchParams, setValue]);

  // Sync the value with the URL search params when it changes.
  useEffect(() => {
    // Wait until the initial value has been loaded before syncing.
    if (!hasLoadedValueRef.current) {
      return;
    }

    const stringifiedValue = stringify(value);
    const newSearchParams = new URLSearchParams(searchParams);

    if (stringifiedValue === undefined) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, stringifiedValue);
    }

    const href_ = href ?? window.location.href;
    const newUrl = new URL(href_);

    // TODO: Replace newUrl's search params with newSearchParams.

    const newUrlString = newUrl.toString();

    // Prevent pushing the same URL to the history.
    if (href_ === newUrlString) {
      return;
    }

    console.debug('Syncing URL search param', key, value, newUrlString);
    setHref(newUrlString);
    router.push(newUrlString);
  }, [href, key, router, searchParams, setHref, stringify, value]);
};

export default useSearchParamSync;
