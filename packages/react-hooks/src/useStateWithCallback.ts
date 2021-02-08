import { useEffect, useRef, useState } from 'react';

type HooksReturnType<T> = [T, (data: T, callback?: (value?: T) => void) => void];

export function useStateWithCallback<T>(init: T): HooksReturnType<T> {
  const [value, _setValue] = useState<T>(init);
  const _history = useRef<T>(init);
  const _callback = useRef<(value?: T) => void>();

  useEffect((): void => {
    if (value !== _history.current) {
      _callback.current && _callback.current(value);
      _history.current = value;
    }
  }, [value]);

  const setValue = (value: any, callback?: (value?: T) => void): void => {
    if (callback) {
      _callback.current = callback;
    }

    _setValue(value);
  };

  return [value, setValue];
}
