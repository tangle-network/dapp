import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const useStateWithRoute = (key: string) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initial = useMemo(() => {
    return searchParams.get(key) ?? '';
  }, [key, searchParams]);

  const [state, setState] = useState(initial);

  // Update amount on search params with debounce
  useEffect(() => {
    function updateParams() {
      if (!state) {
        setSearchParams((prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.delete(key);
          return nextParams;
        });
        return;
      }

      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set(key, state);
        return nextParams;
      });
    }

    const timeout = setTimeout(updateParams, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [key, setSearchParams, state]);

  useEffect(() => {
    setState(initial);
  }, [initial]);

  return [state, setState] as const;
};

export default useStateWithRoute;
