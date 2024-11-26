'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export enum HistoryUpdateType {
  PUSH = 'push',
  REPLACE = 'replace',
}

function useQueryState(
  key: string,
  historyUpdateType: HistoryUpdateType = HistoryUpdateType.PUSH,
) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(() => {
    return searchParams.get(key) || null;
  });

  useEffect(() => {
    const currentValue = searchParams.get(key);
    if (currentValue !== value) {
      setValue(currentValue || null);
    }
  }, [searchParams, key, value]);

  const updateValue = useCallback(
    (newValue: string | null) => {
      setValue(newValue);
      const newSearchParams = new URLSearchParams(searchParams.toString());
      if (newValue) {
        newSearchParams.set(key, newValue);
      } else {
        newSearchParams.delete(key);
      }

      const url = `${pathname}?${newSearchParams.toString()}`;
      if (historyUpdateType === HistoryUpdateType.PUSH) {
        router.push(url);
      } else {
        router.replace(url);
      }
    },
    [key, pathname, router, searchParams, historyUpdateType],
  );

  return [value, updateValue] as const;
}

export default useQueryState;
