import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

export enum HistoryUpdateType {
  PUSH = 'push',
  REPLACE = 'replace',
}

function useQueryState(
  key: string,
  historyUpdateType: HistoryUpdateType = HistoryUpdateType.PUSH,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

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
        navigate(url);
      } else {
        navigate(url, { replace: true });
      }
    },
    [key, pathname, navigate, searchParams, historyUpdateType],
  );

  return [value, updateValue] as const;
}

export default useQueryState;
