import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';

// A global, centralized store of search params is needed
// to prevent data races when multiple hook instances are
// trying to update the search params at the same time.
const useSearchParamsZustandStore = create<{
  searchParams: URLSearchParams | null;
  setSearchParams: (searchParams: URLSearchParams) => void;
}>((set) => ({
  searchParams: null,
  setSearchParams: (searchParams) => set({ searchParams }),
}));

const useSearchParamsStore = () => {
  const [routerSearchParams, setRouterSearchParams] = useSearchParams();

  const {
    searchParams: bufferSearchParams,
    setSearchParams: setBufferSearchParams,
  } = useSearchParamsZustandStore();

  const didInitializeRef = useRef(false);

  useEffect(() => {
    if (didInitializeRef.current || !routerSearchParams) {
      return;
    }

    didInitializeRef.current = true;
    setBufferSearchParams(routerSearchParams);
  }, [routerSearchParams, setBufferSearchParams]);

  const updateSearchParam = useCallback(
    (key: string, value: string | undefined) => {
      if (!bufferSearchParams) {
        return;
      }

      const newSearchParams = new URLSearchParams(
        bufferSearchParams.toString(),
      );

      if (value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }

      setBufferSearchParams(newSearchParams);
      setRouterSearchParams(newSearchParams); // Update the URL

      return newSearchParams;
    },
    [bufferSearchParams, setBufferSearchParams, setRouterSearchParams],
  );

  return { searchParams: bufferSearchParams, updateSearchParam };
};

export default useSearchParamsStore;
