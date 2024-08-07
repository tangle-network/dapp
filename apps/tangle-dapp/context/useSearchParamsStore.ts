'use client';

import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { create } from 'zustand';

// A global, centralized store of search params is needed
// to prevent data races when multiple hook instances are
// trying to update the search params at the same time.
const useSearchParamsZustandStore = create<{
  href?: string;
  searchParams: ReadonlyURLSearchParams;
  setSearchParams: (searchParams: ReadonlyURLSearchParams) => void;
  setHref: (href: string) => void;
}>((set) => ({
  searchParams: new ReadonlyURLSearchParams(),
  setSearchParams: (searchParams) => set({ searchParams }),
  setHref: (href) => set({ href }),
}));

const useSearchParamsStore = () => {
  const searchParams = useSearchParams();

  const {
    searchParams: zustandSearchParams,
    setSearchParams: updateZustandSearchParams,
    href,
    setHref,
  } = useSearchParamsZustandStore();

  // Maintain global search params state in sync with
  // those provided by the Next.js router.
  useEffect(() => {
    updateZustandSearchParams(searchParams);
  }, [searchParams, updateZustandSearchParams]);

  return { searchParams: zustandSearchParams, href, setHref };
};

export default useSearchParamsStore;
