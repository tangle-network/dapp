import { useState, useEffect, useCallback } from 'react';

export function useInterval<T> (callback: () => Promise<T> | T, interval: number, immediately?: boolean): T | null {
  const [data, setData] = useState<T | null>(null);

  const _exec = useCallback((): void => {
    (async (): Promise<void> => {
      const result = await callback();

      setData(result);
    })();
  }, [callback]);

  useEffect(() => {
    if (immediately) {
      _exec();
    }

    const _i = setInterval(_exec, interval);

    return (): void => {
      clearInterval(_i);
    };
  }, [_exec, immediately, interval]);

  return data;
}
