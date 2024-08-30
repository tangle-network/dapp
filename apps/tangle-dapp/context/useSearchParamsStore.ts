'use client';

import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';

// A global, centralized store of search params is needed
// to prevent data races when multiple hook instances are
// trying to update the search params at the same time.
const useSearchParamsZustandStore = create<{
  searchParams: ReadonlyURLSearchParams | null;
  setSearchParams: (searchParams: ReadonlyURLSearchParams) => void;
}>((set) => ({
  searchParams: null,
  setSearchParams: (searchParams) => set({ searchParams }),
}));

const useSearchParamsStore = () => {
  const routerSearchParams = useSearchParams();

  const {
    searchParams: bufferSearchParams,
    setSearchParams: setBufferSearchParams,
  } = useSearchParamsZustandStore();

  const didInitializeRef = useRef(false);

  useEffect(() => {
    if (didInitializeRef.current || routerSearchParams === null) {
      return;
    }

    didInitializeRef.current = true;
    setBufferSearchParams(routerSearchParams);
  }, [routerSearchParams, setBufferSearchParams]);

  // TODO: Sort params by name so that after each update, the URL search params don't "flicker" due to their positions changing.
  const updateSearchParam = useCallback(
    (key: string, value: string | undefined) => {
      if (bufferSearchParams === null) {
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

      const newReadonlySearchParams = new ReadonlyURLSearchParams(
        newSearchParams,
      );

      setBufferSearchParams(newReadonlySearchParams);

      return newReadonlySearchParams;
    },
    [bufferSearchParams, setBufferSearchParams],
  );

  return { searchParams: bufferSearchParams, updateSearchParam };
};

export default useSearchParamsStore;
