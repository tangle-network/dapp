import { useState } from 'react';

import useSearchParamSync from './useSearchParamSync';

export type SearchParamStateOptions<T> = {
  key: string;
  defaultValue: T;
  parser: (value: string) => T | undefined;
  stringify: (value: T) => string | undefined;
};

const useSearchParamState = <T>({
  key,
  defaultValue,
  parser: parse,
  stringify,
}: SearchParamStateOptions<T>): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(defaultValue);

  useSearchParamSync<T>({
    key,
    value: value,
    parse,
    stringify,
    setValue,
  });

  return [value, setValue] as const;
};

export default useSearchParamState;
