'use client';

import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { create } from 'zustand';

const useSearchParamsZustandStore = create<{
  searchParams: ReadonlyURLSearchParams;
  setSearchParams: (searchParams: ReadonlyURLSearchParams) => void;
}>((set) => ({
  searchParams: new ReadonlyURLSearchParams(),
  setSearchParams: (searchParams) =>
    set({
      searchParams,
    }),
}));

const useSearchParamsStore = () => {
  const searchParams = useSearchParams();

  const {
    searchParams: zustandSearchParams,
    setSearchParams: updateZustandSearchParams,
  } = useSearchParamsZustandStore();

  useEffect(() => {
    updateZustandSearchParams(searchParams);
  }, [searchParams, updateZustandSearchParams]);

  return zustandSearchParams;
};

export default useSearchParamsStore;
