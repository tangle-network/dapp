import { useEffect, useState } from 'react';

function usePromise<T>(fetcher: () => Promise<T>, fallbackValue: T) {
  const [result, setResult] = useState<T>(fallbackValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);

    fetcher().then((newResult) => {
      if (!isMounted) {
        return;
      }

      setResult(newResult);
    });

    return () => {
      isMounted = false;
    };
  }, [fetcher]);

  return { result, isLoading };
}

export default usePromise;
