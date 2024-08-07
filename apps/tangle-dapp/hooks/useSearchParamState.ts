import { Dispatch, SetStateAction, useState } from 'react';

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
}: SearchParamStateOptions<T>): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(defaultValue);

  useSearchParamSync({ key, value, parse, stringify, setValue });

  return [value, setValue] as const;
};

export default useSearchParamState;
