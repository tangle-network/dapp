import { useState, useCallback } from 'react';

interface HooksReturnType {
  isInitialized: boolean;
  setEnd: () => void;
}

export const useInitialize = (): HooksReturnType => {
  const [status, setStatus] = useState<boolean>(false);

  const setEnd = useCallback(() => {
    setStatus(true);
  }, [setStatus]);

  return { isInitialized: status, setEnd };
};
