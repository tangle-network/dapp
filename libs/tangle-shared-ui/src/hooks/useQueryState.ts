'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export enum HistoryUpdateType {
  PUSH = 'push',
  REPLACE = 'replace',
}

function useQueryState(
  key: string,
  historyUpdateType: HistoryUpdateType = HistoryUpdateType.PUSH,
) {
  const router = useRouter();
  const [value, setValue] = useState(() => {
    return router.query[key] || null;
  });

  useEffect(() => {
    const currentValue = router.query[key];
    if (currentValue !== value) {
      setValue(currentValue || null);
    }
  }, [router.query, key, value]);

  const updateValue = useCallback(
    (newValue: string | string[] | null) => {
      setValue(newValue);
      const newQuery = { ...router.query };
      if (newValue) {
        newQuery[key] = newValue;
      } else {
        delete newQuery[key];
      }

      router[historyUpdateType](
        { pathname: router.pathname, query: newQuery },
        undefined,
        {
          shallow: true,
        },
      );
    },
    [key, router, historyUpdateType],
  );

  return [value, updateValue] as const;
}

export default useQueryState;
