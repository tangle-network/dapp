import { useEffect, useState } from 'react';

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
 * @param action The Promise to execute.
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
function usePromise<T>(action: () => Promise<T>, fallbackValue: T) {
  const [result, setResult] = useState<T>(fallbackValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);

    action().then((newResult) => {
      if (!isMounted) {
        return;
      }

      setResult(newResult);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [action]);

  return { result, isLoading };
}

export default usePromise;
