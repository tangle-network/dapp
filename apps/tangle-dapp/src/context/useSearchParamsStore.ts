import { useSearchParams } from 'react-router';
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
  const [searchParams] = useSearchParams();

  const {
    searchParams: bufferSearchParams,
    setSearchParams: setBufferSearchParams,
  } = useSearchParamsZustandStore();

  const didInitializeRef = useRef(false);

  useEffect(() => {
    if (didInitializeRef.current) {
      return;
    }

    didInitializeRef.current = true;
    setBufferSearchParams(searchParams);
  }, [searchParams, setBufferSearchParams]);

  const sortSearchParams = useCallback((params: URLSearchParams) => {
    const sortedEntries = Array.from(params.entries()).sort(
      ([leftKey, leftValue], [rightKey, rightValue]) => {
        const byKey = leftKey.localeCompare(rightKey);
        return byKey === 0 ? leftValue.localeCompare(rightValue) : byKey;
      },
    );

    return new URLSearchParams(sortedEntries);
  }, []);

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

      const sortedSearchParams = sortSearchParams(newSearchParams);

      setBufferSearchParams(sortedSearchParams);

      return sortedSearchParams;
    },
    [bufferSearchParams, setBufferSearchParams, sortSearchParams],
  );

  return { searchParams: bufferSearchParams, updateSearchParam };
};

export default useSearchParamsStore;
