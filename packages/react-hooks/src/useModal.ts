import { useState, useCallback, useEffect, useRef } from 'react';
import { noop } from 'lodash';

interface ReturnData {
  close: () => void;
  open: () => void;
  status: boolean;
  toggle: () => void;
  update: (status: boolean) => void;
}

export const useModal = (defaultStatus = false, callback?: () => void): ReturnData => {
  const [status, setStatus] = useState<boolean>(defaultStatus);
  const open = useCallback((): void => setStatus(true), []);
  const close = useCallback((): void => setStatus(false), []);
  const toggle = useCallback((): void => setStatus(!status), [status]);
  const _callback = useRef<() => void>(callback || noop);
  const update = useCallback((status: boolean): void => setStatus(status), []);

  useEffect(() => {
    _callback.current();
  }, [status, _callback]);

  return { close, open, status, toggle, update };
};
