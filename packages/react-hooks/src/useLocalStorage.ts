import { useMemo, useState } from 'react';

const tryParse = (maybeJson: string | null): Record<string, unknown> | string | null => {
  try {
    return JSON.parse(maybeJson as any);
  } catch (e) {
    return maybeJson;
  }
};
export const useLocalStorage = (key: string): [any, (v: string) => void] => {
  const [_value, _setValue] = useState(localStorage.getItem(key));

  const value = useMemo(() => tryParse(_value), [_value]);
  return [
    value,
    (v: string) => {
      _setValue(v);
      localStorage.setItem(key, v);
    },
  ];
};
