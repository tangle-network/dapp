'use client';

import { useCallback, useState } from 'react';

interface ReturnData {
  close: () => void;
  open: () => void;
  status: boolean;
  toggle: () => void;
  update: (status: boolean) => void;
}

export const useModal = (defaultStatus = false): ReturnData => {
  const [status, setStatus] = useState<boolean>(defaultStatus);

  const open = useCallback((): void => setStatus(true), []);
  const close = useCallback((): void => setStatus(false), []);

  const toggle = useCallback((): void => setStatus((prev) => !prev), []);
  const update = useCallback((status: boolean): void => setStatus(status), []);

  return { close, open, status, toggle, update };
};
