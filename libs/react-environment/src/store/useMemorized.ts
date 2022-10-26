import { useEffect, useRef, useState } from 'react';

export const useMemorized = <T>(value: T): T => {
  const [_value, setValue] = useState<T>(value);
  const ref = useRef<T>(value);

  useEffect(() => {
    if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
      ref.current = value;
      setValue(value);
    }
  }, [value, setValue]);

  return _value;
};
