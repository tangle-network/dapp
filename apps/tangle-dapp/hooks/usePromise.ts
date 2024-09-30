import { useEffect, useState } from 'react';

import ensureError from '../utils/ensureError';
import useIsMountedRef from './useIsMountedRef';

/**
 * An utility hook that simplifies working with Promise objects
 * in React components. This abstracts away the need for manually
 * managing the state of the Promise and the result, and the need
 * for `useEffect` hooks.
 *
 * This is different from things like `useSWR` or other data fetching
 * hooks because it doesn't focus around data fetching, but rather around
 * general Promise execution.
 *
 * @param factory The Promise to execute.
 *
 * @param fallbackValue The value to use while the Promise is executing.
 *
 * @returns An object containing the result of the Promise and a boolean
 * indicating whether the Promise is still executing.
 *
 * @example
 * ```ts
 * const { result, isLoading } =
 *  usePromise<AsyncResultType | null>(() => someAsyncAction(), null);
 * ```
 *
 *  @example
 * ```ts
 * const { result, isLoading } =
 *  usePromise<AsyncResultType | null>(async () => {
 *    const result = await someAsyncAction();
 *
 *    // ... Do something with the result ...
 *
 *    return result;
 *  }, null);
 * ```
 */
function usePromise<T>(factory: () => Promise<T>, fallbackValue: T) {
  const [result, setResult] = useState<T>(fallbackValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useIsMountedRef();

  useEffect(() => {
    if (!isMounted.current) {
      return;
    }

    // The `isMounted` ref checks if the component is mounted globally,
    // while `isSubscribe` flag manages the subscription state for this specific effect.
    // `isMounted` prevents updates after component unmount,
    // `isSubscribe` allows proper cleanup if the effect re-runs before the promise resolves.
    let isSubscribe = true;
    setIsLoading(true);

    factory()
      .then((newResult) => {
        if (!isMounted.current || !isSubscribe) {
          return;
        }

        setResult(newResult);
      })
      .catch((possibleError: unknown) => {
        if (!isMounted.current || !isSubscribe) {
          return;
        }

        setError(ensureError(possibleError));
      })
      .finally(() => {
        if (!isMounted.current || !isSubscribe) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isSubscribe = false;
    };
  }, [factory, isMounted]);

  return { result, isLoading, error };
}

export default usePromise;
